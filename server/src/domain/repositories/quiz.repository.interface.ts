import type { Quiz } from '../models/quiz.model'

export interface QuizRepositoryInterface {
  findAllPublic: () => Promise<Quiz[]>
  findAllWithSecret: () => Promise<Quiz[]>
  findById: (id: number) => Promise<Quiz | null>
  findByUser: (userId: number) => Promise<Quiz[]>
  create: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz>
  update: (quizId: number, userId: number, update: Partial<Quiz>) => Promise<Quiz | null>
  deleteQuiz: (quizId: number, userId: number) => Promise<boolean>
  updateIsPublic: (quizId: number, userId: number, isPublic: boolean) => Promise<Quiz | null>
  findRandomPublic: (limit: number) => Promise<Quiz[]>
}
