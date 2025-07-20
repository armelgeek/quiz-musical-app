import type {
  QuizResult,
  QuizResultsRepositoryInterface
} from '../../../domain/repositories/quiz-results.repository.interface'

export class SaveQuizResultUseCase {
  constructor(private repo: QuizResultsRepositoryInterface) {}

  execute(userId: string, result: Omit<QuizResult, 'userId' | 'updatedAt' | 'completedAt'>): Promise<QuizResult> {
    return this.repo.saveQuizResult(userId, result)
  }
}

export class GetQuizResultsByUserUseCase {
  constructor(private repo: QuizResultsRepositoryInterface) {}

  execute(userId: string, page?: number, limit?: number) {
    return this.repo.getQuizResultsByUser(userId, page, limit)
  }
}
export class GetQuizResultsByCodeUseCase {
   constructor(private repo: QuizResultsRepositoryInterface) {}

  execute(code: string): Promise<QuizResult | null> {
    return this.repo.getQuizResultsByCode(code)
  }
}