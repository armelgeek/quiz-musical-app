import { desc, gte, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { quizResults } from '../database/schema/quiz'

export class QuizResultsRepository {
  /** Classement générique (all, day, week, month) */
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
      .select({ userId: quizResults.userId, totalScore: sql`SUM(${quizResults.score})` })
      .from(quizResults)
      .groupBy(quizResults.userId)
      .orderBy(desc(sql`SUM(${quizResults.score})`))
    if (where) query.where(where)
    if (limit) query.limit(limit)
  const results = await query
  // Cast totalScore to number for type safety
  return results.map(r => ({ ...r, totalScore: Number(r.totalScore) }))
  }

  /** Podium du jour (top 3) */
  getPodiumOfDay() {
    return this.getLeaderboard('day', 3)
  }
}
