import { eq } from 'drizzle-orm'
import type { UserStats, UserStatsRepositoryInterface } from '@/domain/repositories/user-stats.repository.interface'
import { db } from '../database/db'
import { DrizzleQuizResultsRepository } from './drizzle-quiz-results.repository'

export class UserStatsRepository implements UserStatsRepositoryInterface {
  private quizResultsRepo = new DrizzleQuizResultsRepository()

  async getUserStats(userId: string): Promise<UserStats> {
    const quizResults = await this.quizResultsRepo.getQuizResultsByUser(userId)
    const uniqueQuizIds = new Set(quizResults.map((q) => q.quizId))
    const quizzesCompleted = uniqueQuizIds.size
    return {
      userId,
      quizzesCompleted,
      achievements: []
    }
  }
}
