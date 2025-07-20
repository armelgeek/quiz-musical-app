import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null
// userId -> Set<socketId>
const userSockets: Map<string, Set<string>> = new Map()

export function attachNotificationSocket(server: any) {
  if (io) return io
  io = new SocketIOServer(server, {
    path: '/ws/notification',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    let registeredUserId: string | null = null
    // Expect client to send userId after connection
    socket.on('register', (userId: string) => {
      registeredUserId = userId
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set())
      }
      userSockets.get(userId)!.add(socket.id)
      io?.emit('connected_count', userSockets.size)
    })
    socket.on('disconnect', () => {
      if (registeredUserId) {
        const sockets = userSockets.get(registeredUserId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            userSockets.delete(registeredUserId)
          }
        }
        io?.emit('connected_count', userSockets.size)
      }
    })
  })
  return io
}

export function emitBadgeNotification(userId: string, badge: any) {
  if (!io) return
  const sockets = userSockets.get(userId)
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit('badge_awarded', badge)
    }
  }
}

// Broadcast to all users (optionally skip the recipient)
export function emitBadgeBroadcast(userId: string, username: string, badge: any) {
  if (!io) return
  io.emit('badge_broadcast', { userId, username, badge })
}
