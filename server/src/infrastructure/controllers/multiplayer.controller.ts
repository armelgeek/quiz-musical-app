import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { MultiplayerRepository } from '../repositories/multiplayer.repository'

const MultiplayerSessionSchema = z.object({
  id: z.number(),
  status: z.string(),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  currentQuestion: z.number().nullable(),
  questions: z.array(z.any()).nullable()
})

const MultiplayerPlayerSchema = z.object({
  id: z.number(),
  sessionId: z.number(),
  userId: z.string(),
  score: z.number(),
  isReady: z.boolean(),
  joinedAt: z.string()
})

export class MultiplayerController {
  public controller: OpenAPIHono
  private repo: MultiplayerRepository

  constructor() {
    this.repo = new MultiplayerRepository()
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    // Créer une partie
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/multiplayer/sessions',
        tags: ['Multiplayer'],
        summary: 'Créer une session multijoueur',
        request: { body: { content: { 'application/json': { schema: z.object({ questions: z.array(z.any()) }) } } } },
        responses: {
          201: { description: 'Session créée', content: { 'application/json': { schema: MultiplayerSessionSchema } } }
        }
      }),
      async (c: any) => {
        const { questions } = await c.req.json()
        const session = await this.repo.createSession(questions)
        return c.json(session, 201)
      }
    )
    // Lister les parties en attente
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/multiplayer/sessions',
        tags: ['Multiplayer'],
        summary: 'Lister les sessions en attente',
        responses: {
          200: {
            description: 'Sessions',
            content: { 'application/json': { schema: z.array(MultiplayerSessionSchema) } }
          }
        }
      }),
      async (c: any) => {
        const sessions = await this.repo.listWaitingSessions()
        return c.json(sessions)
      }
    )
    // Rejoindre une partie
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/multiplayer/sessions/:id/join',
        tags: ['Multiplayer'],
        summary: 'Rejoindre une session',
        request: {
          params: z.object({ id: z.string() }),
          body: { content: { 'application/json': { schema: z.object({ userId: z.string() }) } } }
        },
        responses: {
          200: { description: 'Joueur ajouté', content: { 'application/json': { schema: MultiplayerPlayerSchema } } }
        }
      }),
      async (c: any) => {
        const sessionId = Number(c.req.param('id'))
        const { userId } = await c.req.json()
        const player = await this.repo.joinSession(sessionId, userId)
        return c.json(player)
      }
    )
    // Marquer prêt
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/multiplayer/sessions/:id/ready',
        tags: ['Multiplayer'],
        summary: 'Marquer un joueur prêt',
        request: {
          params: z.object({ id: z.string() }),
          body: { content: { 'application/json': { schema: z.object({ userId: z.string() }) } } }
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } }
        }
      }),
      async (c: any) => {
        const sessionId = Number(c.req.param('id'))
        const { userId } = await c.req.json()
        await this.repo.setPlayerReady(sessionId, userId)
        return c.json({ success: true })
      }
    )
    // Démarrer la partie
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/multiplayer/sessions/:id/start',
        tags: ['Multiplayer'],
        summary: 'Démarrer une session',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: z.object({ success: z.boolean() }) } } }
        }
      }),
      async (c: any) => {
        const sessionId = Number(c.req.param('id'))
        await this.repo.startSession(sessionId)
        return c.json({ success: true })
      }
    )
    // Récupérer l’état d’une partie
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/multiplayer/sessions/:id',
        tags: ['Multiplayer'],
        summary: 'Récupérer une session',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: { description: 'Session', content: { 'application/json': { schema: MultiplayerSessionSchema } } }
        }
      }),
      async (c: any) => {
        const sessionId = Number(c.req.param('id'))
        const session = await this.repo.getSession(sessionId)
        return c.json(session)
      }
    )
    // Lister les joueurs d’une partie
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/multiplayer/sessions/:id/players',
        tags: ['Multiplayer'],
        summary: 'Lister les joueurs d’une session',
        request: { params: z.object({ id: z.string() }) },
        responses: {
          200: { description: 'Joueurs', content: { 'application/json': { schema: z.array(MultiplayerPlayerSchema) } } }
        }
      }),
      async (c: any) => {
        const sessionId = Number(c.req.param('id'))
        const players = await this.repo.listPlayers(sessionId)
        return c.json(players)
      }
    )
  }
}
