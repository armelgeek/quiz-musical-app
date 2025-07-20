
import type { UserType } from './user.model'

// Quiz domain model
type QuizQuestion = {
  question: string
  options: string[]
  answer: string
}

export interface Quiz {
  id: number
  title: string
  instruction: string
  passingScore: number
  maxScore: number
  xpReward: number
  subject: string
  topic: string
  duration: string
  code: string
  createdBy: string | UserType
  isPublic: boolean
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export type { QuizQuestion }
