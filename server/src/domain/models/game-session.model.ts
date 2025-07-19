import type { Quiz } from './quiz.model'

export interface GameSession {
  id: number
  userId: number
  quizzes: Quiz[]
  status: 'active' | 'completed'
  startedAt: string
  endedAt?: string
}
