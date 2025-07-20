import { eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { users } from '../database/schema'
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

  async getQuizResultsByUser(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
        .orderBy(sql`${quizResults.completedAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`COUNT(*)` })
        .from(quizResults)
        .where(eq(quizResults.userId, userId))
    ])
    const items = Array.isArray(rows) ? (rows as QuizResult[]) : []
    const total = Number(countResult[0]?.count || 0)
    const totalPages = Math.ceil(total / limit)
    return {
      items,
      total,
      page,
      limit,
      totalPages
    }
  }

  async getLeaderboard(
    period: 'all' | 'day' | 'week' | 'month',
    limit?: number
  ): Promise<{ userId: string; totalScore: number; user: { name: string; image: string | null } }[]> {
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
      .select({
        userId: quizResults.userId,
        totalScore: sql`SUM(${quizResults.score})`,
        name: users.name,
        image: users.image
      })
      .from(quizResults)
      .leftJoin(users, eq(quizResults.userId, users.id))
      .groupBy(quizResults.userId, users.name, users.image)
      .orderBy(sql`totalScore DESC`)
    const rows = whereSql ? await query.where(whereSql) : await query
    const arr = rows.map((r) => ({
      userId: r.userId,
      totalScore: Number(r.totalScore),
      user: {
        name: r.name ?? '',
        image: r.image ?? null
      }
    }))
    return limit ? arr.slice(0, limit) : arr
  }

  async getPodiumOfDay(): Promise<
    { userId: string; totalScore: number; user: { name: string; image: string | null } }[]
  > {
    const today = new Date().toISOString().slice(0, 10)
    const rows = await db
      .select({
        userId: quizResults.userId,
        totalScore: sql`SUM(${quizResults.score})`,
        name: users.name,
        image: users.image
      })
      .from(quizResults)
      .leftJoin(users, eq(quizResults.userId, users.id))
      .where(sql`DATE(${quizResults.completedAt}) = ${today}`)
      .groupBy(quizResults.userId, users.name, users.image)
      .orderBy(sql`totalScore DESC`)
    const arr = rows.map((r) => ({
      userId: r.userId,
      totalScore: Number(r.totalScore),
      user: {
        name: r.name ?? '',
        image: r.image ?? null
      }
    }))
    return arr.slice(0, 3)
  }
}
