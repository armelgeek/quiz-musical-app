import { desc, gte, sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { db } from '../database/db'
import { users } from '../database/schema/auth'
import { quizResults } from '../database/schema/quiz'

import type {
  QuizResult,
  QuizResultsRepositoryInterface
} from '../../domain/repositories/quiz-results.repository.interface'

export class QuizResultsRepository implements QuizResultsRepositoryInterface {
  // Stub implementations for interface compatibility
  saveQuizResult(): Promise<QuizResult> {
    throw new Error('Not implemented')
  }
  getQuizResultsByUser(): Promise<{
    items: QuizResult[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    throw new Error('Not implemented')
  }
  getQuizResultsByCode(): Promise<QuizResult | null> {
    throw new Error('Not implemented')
  }
  async getLeaderboard(period: 'all' | 'day' | 'week' | 'month', limit?: number) {
    let where = undefined
    const now = new Date()
    if (period === 'day') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      where = gte(quizResults.completedAt, start)
    } else if (period === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      where = gte(quizResults.completedAt, start)
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      where = gte(quizResults.completedAt, start)
    }
    const query = db
      .select({
        userId: quizResults.userId,
        totalScore: sql`SUM(${quizResults.score})`,
        name: users.name,
        image: users.image
      })
      .from(quizResults)
      .leftJoin(users, eq(quizResults.userId, users.id))
      .groupBy(quizResults.userId, users.name, users.image)
      .orderBy(desc(sql`SUM(${quizResults.score})`))
    if (where) query.where(where)
    if (limit) query.limit(limit)
    const results = await query
    return results.map((r) => ({
      userId: r.userId,
      totalScore: Number(r.totalScore),
      user: {
        name: r.name ?? '',
        image: r.image ?? null
      }
    }))
  }

  getPodiumOfDay() {
    return this.getLeaderboard('day', 3)
  }
}
