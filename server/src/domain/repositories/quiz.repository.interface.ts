import type { Quiz } from '../models/quiz.model'

export interface QuizRepositoryInterface {
  findAllPublic: () => Promise<Quiz[]>
  findAllWithSecret: () => Promise<Quiz[]>
  findById: (id: number) => Promise<Quiz | null>
  findByCode: (code: string) => Promise<Quiz | null>
  findByUser: (userId: string) => Promise<Quiz[]>
  create: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz>
  update: (quizId: number, userId: string, update: Partial<Quiz>) => Promise<Quiz | null>
  deleteQuiz: (quizId: number, userId: string) => Promise<boolean>
  updateIsPublic: (quizId: number, userId: string, isPublic: boolean) => Promise<Quiz | null>
  findRandomPublic: (limit: number) => Promise<Quiz[]>
}
