import { Server as SocketIOServer } from 'socket.io'
import { BattleRoyaleSessionUseCase } from '@/application/use-cases/game-session/battle-royale-session.usecase'
import { BadgeRepository } from '@/infrastructure/repositories/badge.repository'
import { BattleRoyaleSessionRepository } from '@/infrastructure/repositories/battle-royale-session.repository'
import { UserRepository } from '@/infrastructure/repositories/user.repository'

let io: SocketIOServer | null = null
// Singleton use case pour accès métier
const brSessionRepo = new BattleRoyaleSessionRepository()
const userRepo = new UserRepository()
const badgeRepo = new BadgeRepository()
const brUseCase = new BattleRoyaleSessionUseCase(brSessionRepo, userRepo, badgeRepo)

export function attachBattleRoyaleSocket(server: any) {
  if (io) return io
  io = new SocketIOServer(server, {
    path: '/ws/battle-royale',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    let userId: string | null = null
    socket.on('auth', (data) => {
      if (typeof data?.userId === 'string' && data.userId.length > 0) {
        userId = data.userId
        socket.data.userId = userId
        socket.emit('authenticated', { userId })
      } else {
        socket.emit('unauthorized', { error: 'userId required' })
        socket.disconnect()
      }
    })

    // Refuser toute action si non authentifié
    function requireAuth(cb: (...args: any[]) => void) {
      return (...args: any[]) => {
        if (!userId) {
          socket.emit('unauthorized', { error: 'Not authenticated' })
          return
        }
        cb(...args)
      }
    }

    socket.emit('connected', { message: 'Connected to Battle Royale WS' })

    // Rejoindre une session Battle Royale (room)
    socket.on(
      'join',
      requireAuth(async (sessionId: string) => {
        socket.join(sessionId)
        // Ajout métier : ajoute le joueur à la session
        const session = await brUseCase.joinSession(Number(sessionId), userId!)
        io?.to(sessionId).emit('player_joined', { sessionId, userId, socketId: socket.id, session })
      })
    )

    // Quitter une session (room)
    socket.on(
      'leave',
      requireAuth((sessionId: string) => {
        socket.leave(sessionId)
        io?.to(sessionId).emit('player_left', { sessionId, userId, socketId: socket.id })
      })
    )

    // Se mettre en mode spectateur (room)
    socket.on(
      'spectate',
      requireAuth((sessionId: string) => {
        socket.join(sessionId)
        io?.to(sessionId).emit('spectator_joined', { sessionId, userId, socketId: socket.id })
      })
    )

    // Élimination d'un joueur (broadcast room)
    socket.on(
      'eliminate',
      requireAuth(async ({ sessionId, userId: eliminatedId, round }) => {
        // Ajout métier : élimine le joueur dans la session
        const session = await brUseCase.eliminatePlayer(Number(sessionId), eliminatedId, round)
        io?.to(sessionId).emit('player_eliminated', { sessionId, userId: eliminatedId, round, session })
      })
    )

    // Passage au round suivant (broadcast room)
    socket.on(
      'next_round',
      requireAuth(async ({ sessionId }) => {
        // Ajout métier : passe au round suivant
        const session = await brUseCase.startNextRound(Number(sessionId))
        io?.to(sessionId).emit('next_round', { sessionId, round: session?.round, session })
      })
    )

    // Déclarer le vainqueur (broadcast room) + nettoyage room
    socket.on(
      'winner',
      requireAuth(async ({ sessionId, userId: winnerId, bonusXp }) => {
        // Ajout métier : set winner, badge, bonus XP
        const session = await brUseCase.setWinner(Number(sessionId), winnerId, bonusXp)
        io?.to(sessionId).emit('winner', { sessionId, userId: winnerId, session })
        // Nettoyage : forcer tous les sockets à quitter la room
        const room = io?.sockets.adapter.rooms.get(sessionId)
        if (room) {
          for (const socketId of room) {
            const s = io?.sockets.sockets.get(socketId)
            s?.leave(sessionId)
          }
        }
      })
    )
  })
  return io
}

export function emitBattleRoyaleEvent(event: string, payload: any) {
  if (!io) return
  io.emit(event, payload)
}
