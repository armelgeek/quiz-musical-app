import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null
const userSocketMap: Map<string, string> = new Map()

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
    // Expect client to send userId after connection
    socket.on('register', (userId: string) => {
      userSocketMap.set(userId, socket.id)
    })
    socket.on('disconnect', () => {
      for (const [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) userSocketMap.delete(userId)
      }
    })
  })
  return io
}

export function emitBadgeNotification(userId: string, badge: any) {
  if (!io) return
  const socketId = userSocketMap.get(userId)
  if (socketId) {
    io.to(socketId).emit('badge_awarded', badge)
  }
}

// Broadcast to all users (optionally skip the recipient)
export function emitBadgeBroadcast(userId: string, username: string, badge: any) {
  if (!io) return
  io.emit('badge_broadcast', { userId, username, badge })
}
