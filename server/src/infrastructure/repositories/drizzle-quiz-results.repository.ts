import { eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { quizResults } from '../database/schema/quiz-results.schema'
import type {
  QuizResult,
  QuizResultsRepositoryInterface
} from '../../domain/repositories/quiz-results.repository.interface'

export class DrizzleQuizResultsRepository implements QuizResultsRepositoryInterface {
  async getQuizResultsByCode(code: string): Promise<QuizResult | null> {
    const rows = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.code, code))
      .orderBy(sql`${quizResults.completedAt} DESC`)
      .limit(1)
    return rows.length > 0 ? (rows[0] as QuizResult) : null
  }
  async saveQuizResult(
    userId: string,
    result: Omit<QuizResult, 'userId' | 'updatedAt' | 'completedAt'>
  ): Promise<QuizResult> {
    const now = new Date()
    const inserted = await db
      .insert(quizResults)
      .values({
        ...result,
        userId,
        completedAt: now,
        updatedAt: now
      })
      .returning()
    return inserted[0] as QuizResult
  }

  async getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
    const rows = await db.select().from(quizResults).where(eq(quizResults.userId, userId))
    return rows as QuizResult[]
  }

  async getLeaderboard(
    period: 'all' | 'day' | 'week' | 'month',
    limit?: number
  ): Promise<{ userId: string; totalScore: number }[]> {
    let whereSql = undefined
    if (period === 'day') {
      // Filter for today
      const today = new Date().toISOString().slice(0, 10)
      whereSql = sql`DATE(${quizResults.completedAt}) = ${today}`
    } else if (period === 'week') {
      // Filter for current week (ISO week)
      whereSql = sql`strftime('%Y-%W', ${quizResults.completedAt}) = strftime('%Y-%W', CURRENT_DATE)`
    } else if (period === 'month') {
      // Filter for current month
      whereSql = sql`strftime('%Y-%m', ${quizResults.completedAt}) = strftime('%Y-%m', CURRENT_DATE)`
    }
    const query = db
      .select({ userId: quizResults.userId, totalScore: sql`SUM(score)` })
      .from(quizResults)
      .groupBy(quizResults.userId)
      .orderBy(sql`totalScore DESC`)
    const rows = whereSql ? await query.where(whereSql) : await query
    const arr = rows.map((r) => ({ userId: r.userId, totalScore: Number(r.totalScore) }))
    return limit ? arr.slice(0, limit) : arr
  }

  async getPodiumOfDay(): Promise<{ userId: string; totalScore: number }[]> {
    const today = new Date().toISOString().slice(0, 10)
    const rows = await db
      .select({ userId: quizResults.userId, totalScore: sql`SUM(score)` })
      .from(quizResults)
      .where(sql`DATE(${quizResults.completedAt}) = ${today}`)
      .groupBy(quizResults.userId)
      .orderBy(sql`totalScore DESC`)
    const arr = rows.map((r) => ({ userId: r.userId, totalScore: Number(r.totalScore) }))
    return arr.slice(0, 3)
  }
}
