import type { QuizResultsRepositoryInterface } from '@/domain/repositories/quiz-results.repository.interface'

export class GetLeaderboardUseCase {
  constructor(private readonly repo: QuizResultsRepositoryInterface) {}

  execute(period: 'all' | 'day' | 'week' | 'month', limit?: number) {
    return this.repo.getLeaderboard(period, limit)
  }
}
