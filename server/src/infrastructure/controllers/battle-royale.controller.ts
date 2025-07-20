import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { BattleRoyaleSessionUseCase } from '@/application/use-cases/game-session/battle-royale-session.usecase'
import { BadgeRepository } from '@/infrastructure/repositories/badge.repository'
import { BattleRoyaleSessionRepository } from '@/infrastructure/repositories/battle-royale-session.repository'
import { UserRepository } from '@/infrastructure/repositories/user.repository'
import { emitBattleRoyaleEvent } from '@/infrastructure/ws/battle-royale.ws'

const brSessionRepo = new BattleRoyaleSessionRepository()
const userRepo = new UserRepository()
const badgeRepo = new BadgeRepository()
const brUseCase = new BattleRoyaleSessionUseCase(brSessionRepo, userRepo, badgeRepo)

const PlayerSchema = z.object({
  userId: z.string(),
  isActive: z.boolean(),
  score: z.number(),
  eliminatedAtRound: z.number().optional()
})

const BattleRoyaleSessionSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  mode: z.literal('battle_royale'),
  round: z.number(),
  players: z.array(PlayerSchema),
  quizzes: z.any(),
  status: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  eliminatedUserIds: z.array(z.string()),
  currentQuestionIndex: z.number(),
  winnerUserId: z.string().optional()
})

export class BattleRoyaleController {
  public controller: OpenAPIHono
  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    // Lister toutes les sessions Battle Royale
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/battle-royale/sessions',
        tags: ['BattleRoyale'],
        summary: 'Lister toutes les sessions Battle Royale',
        responses: {
          200: {
            description: 'Liste des sessions',
            content: { 'application/json': { schema: z.array(BattleRoyaleSessionSchema) } }
          }
        }
      }),
      async (c: any) => {
        const sessions = await brSessionRepo.list()
        return c.json(sessions)
      }
    )

    // Récupérer une session par ID (spectateur)
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/battle-royale/sessions/:id',
        tags: ['BattleRoyale'],
        summary: 'Récupérer une session Battle Royale par ID',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Session trouvée',
            content: { 'application/json': { schema: BattleRoyaleSessionSchema } }
          },
          404: {
            description: 'Session non trouvée',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } }
          }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const session = await brSessionRepo.findById(Number(id))
        if (!session) return c.json({ error: 'Session not found' }, 404)
        return c.json(session)
      }
    )
    // Créer une session Battle Royale
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions',
        tags: ['BattleRoyale'],
        summary: 'Créer une session Battle Royale',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({ quizzes: z.any(), userId: z.string() })
              }
            }
          }
        },
        responses: {
          201: { description: 'Session créée', content: { 'application/json': { schema: BattleRoyaleSessionSchema } } }
        }
      }),
      async (c: any) => {
        const { quizzes, userId } = await c.req.json()
        if (!quizzes || !userId) {
          return c.json({ success: false, error: 'quizzes and userId are required' }, 400)
        }
        const session = await brSessionRepo.create({
          userId,
          mode: 'battle_royale',
          round: 1,
          players: [{ userId, isActive: true, score: 0 }],
          quizzes,
          status: 'active',
          startedAt: new Date().toISOString(),
          eliminatedUserIds: [],
          currentQuestionIndex: 0
        })
        emitBattleRoyaleEvent('session_created', session)
        return c.json(session, 201)
      }
    )

    // Rejoindre une session
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions/:id/join',
        tags: ['BattleRoyale'],
        summary: 'Rejoindre une session Battle Royale',
        request: {
          params: z.object({ id: z.string() }),
          body: { content: { 'application/json': { schema: z.object({ userId: z.string() }) } } }
        },
        responses: {
          200: {
            description: 'Session rejointe',
            content: { 'application/json': { schema: BattleRoyaleSessionSchema } }
          }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const { userId } = await c.req.json()
        const session = await brUseCase.joinSession(Number(id), userId)
        emitBattleRoyaleEvent('player_joined', { sessionId: Number(id), userId })
        return c.json(session)
      }
    )

    // Démarrer une session Battle Royale
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions/:id/start',
        tags: ['BattleRoyale'],
        summary: 'Démarrer une session Battle Royale',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Session démarrée',
            content: { 'application/json': { schema: BattleRoyaleSessionSchema } }
          },
          404: {
            description: 'Session non trouvée',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } }
          }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const session = await brSessionRepo.findById(Number(id))
        if (!session) return c.json({ error: 'Session not found' }, 404)
        if (session.status === 'active') {
          return c.json(session)
        }
        const updated = await brSessionRepo.update(Number(id), {
          status: 'active',
          startedAt: new Date().toISOString()
        })
        emitBattleRoyaleEvent('session_started', updated)
        return c.json(updated)
      }
    )

    // Passer au round suivant
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions/:id/next-round',
        tags: ['BattleRoyale'],
        summary: 'Passer au round suivant',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: { description: 'Round suivant', content: { 'application/json': { schema: BattleRoyaleSessionSchema } } }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const session = await brUseCase.startNextRound(Number(id))
        emitBattleRoyaleEvent('next_round', { sessionId: Number(id), round: session?.round })
        return c.json(session)
      }
    )

    // Eliminer un joueur
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions/:id/eliminate',
        tags: ['BattleRoyale'],
        summary: 'Eliminer un joueur',
        request: {
          params: z.object({ id: z.string() }),
          body: { content: { 'application/json': { schema: z.object({ userId: z.string(), round: z.number() }) } } }
        },
        responses: {
          200: { description: 'Joueur éliminé', content: { 'application/json': { schema: BattleRoyaleSessionSchema } } }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const { userId, round } = await c.req.json()
        const session = await brUseCase.eliminatePlayer(Number(id), userId, round)
        emitBattleRoyaleEvent('player_eliminated', { sessionId: Number(id), userId, round })
        return c.json(session)
      }
    )

    // Déclarer le vainqueur
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/battle-royale/sessions/:id/winner',
        tags: ['BattleRoyale'],
        summary: 'Déclarer le vainqueur',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': { schema: z.object({ userId: z.string(), bonusXp: z.number().optional() }) }
            }
          }
        },
        responses: {
          200: {
            description: 'Vainqueur déclaré',
            content: { 'application/json': { schema: BattleRoyaleSessionSchema } }
          }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const { userId, bonusXp } = await c.req.json()
        const session = await brUseCase.setWinner(Number(id), userId, bonusXp)
        emitBattleRoyaleEvent('winner', { sessionId: Number(id), userId })
        return c.json(session)
      }
    )

    // Lister les participants d'une session Battle Royale
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/battle-royale/sessions/:id/participants',
        tags: ['BattleRoyale'],
        summary: "Lister les participants (joueurs et spectateurs) d'une session Battle Royale",
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: {
            description: 'Liste des participants',
            content: { 'application/json': { schema: z.array(PlayerSchema) } }
          },
          404: {
            description: 'Session non trouvée',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } }
          }
        }
      }),
      async (c: any) => {
        const { id } = c.req.param()
        const session = await brSessionRepo.findById(Number(id))
        if (!session) return c.json({ error: 'Session not found' }, 404)
        // Tous les joueurs, qu'ils soient actifs ou éliminés, restent dans la liste
        return c.json(session.players)
      }
    )
  }
}
