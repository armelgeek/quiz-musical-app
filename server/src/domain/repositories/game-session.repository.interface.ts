import type { GameSession } from '../models/game-session.model'

export interface GameSessionRepositoryInterface {
  create: (userId: number, quizzes: any[]) => Promise<GameSession>
  findActiveByUser: (userId: number) => Promise<GameSession | null>
  complete: (sessionId: number) => Promise<GameSession | null>
  findById: (sessionId: number) => Promise<GameSession | null>
  findAllByUser: (userId: number) => Promise<GameSession[]>
}
