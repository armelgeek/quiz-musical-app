import type { Quiz } from '../../../domain/models/quiz.model'
import type { QuizRepositoryInterface } from '../../../domain/repositories/quiz.repository.interface'

export class GetAllQuizzesUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute() {
    const quizzes = await this.quizRepo.findAllPublic()
    return { success: true, quizzes }
  }
}

export class GetAllQuizzesWithSecretUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute() {
    const quizzes = await this.quizRepo.findAllWithSecret()
    return { success: true, quizzes }
  }
}

export class GetQuizByIdUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(id: number) {
    const quiz = await this.quizRepo.findById(id)
    if (!quiz) return { success: false, error: 'Quiz not found' }
    return { success: true, quiz }
  }
}

export class GetQuizzesByUserUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(userId: string) {
    const quizzes = await this.quizRepo.findByUser(userId)
    return { success: true, quizzes }
  }
}

export class CreateQuizUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) {
    const created = await this.quizRepo.create(quiz)
    return { success: true, quiz: created }
  }
}

export class UpdateQuizUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(quizId: number, userId: string, update: Partial<Quiz>) {
    const updated = await this.quizRepo.update(quizId, userId, update)
    if (!updated) return { success: false, error: 'Quiz not found or unauthorized' }
    return { success: true, quiz: updated }
  }
}

export class DeleteQuizUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(quizId: number, userId: string) {
    const deleted = await this.quizRepo.deleteQuiz(quizId, userId)
    if (!deleted) return { success: false, error: 'Quiz not found or unauthorized' }
    return { success: true }
  }
}

export class UpdateQuizIsPublicUseCase {
  constructor(private quizRepo: QuizRepositoryInterface) {}
  async execute(quizId: number, userId: string, isPublic: boolean) {
    const updated = await this.quizRepo.updateIsPublic(quizId, userId, isPublic)
    if (!updated) return { success: false, error: 'Quiz not found or unauthorized' }
    return { success: true, quiz: updated }
  }
}
