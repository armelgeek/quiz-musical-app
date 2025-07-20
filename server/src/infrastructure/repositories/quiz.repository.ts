import process from 'node:process'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { createClient } from 'redis'
import type { QuizRepositoryInterface } from '@/domain/repositories/quiz.repository.interface'
import { db } from '../database/db'
import { quizzes } from '../database/schema/quiz'

import type { Quiz, QuizQuestion } from '../../domain/models/quiz.model'
import { generateUniqueQuizCode } from './quiz-code.util'

export class QuizRepository implements QuizRepositoryInterface {
  private readonly REDIS_KEY = 'public_quiz_ids'
  private readonly CACHE_TTL = 5 * 60 // 5 min
  private redis

  constructor() {
    this.redis = createClient({ url: process.env.REDIS_URL })
    this.redis.connect().catch(() => {})
  }

  mapDbQuiz(row: any): Quiz {
    return {
      id: row.id,
      title: row.title,
      instruction: row.instruction,
      passingScore: row.passingScore,
      maxScore: row.maxScore,
      xpReward: row.xpReward,
      subject: row.subject,
      topic: row.topic,
      duration: row.duration,
      code: row.code,
      createdBy: row.createdBy,
      isPublic: row.isPublic ?? true,
      questions: Array.isArray(row.questions) ? (row.questions as QuizQuestion[]) : ([] as QuizQuestion[]),
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : ''
    }
  }

  async findAllPublic() {
    const result = await db.select().from(quizzes).where(eq(quizzes.isPublic, true)).orderBy(desc(quizzes.createdAt))
    return result.map(this.mapDbQuiz)
  }

  async findAllWithSecret() {
    const result = await db.select().from(quizzes).orderBy(desc(quizzes.createdAt))
    return result.map(this.mapDbQuiz)
  }

  async findById(id: number) {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id))
    return result[0] ? this.mapDbQuiz(result[0]) : null
  }

  async findByUser(userId: string) {
    const result = await db.select().from(quizzes).where(eq(quizzes.createdBy, userId)).orderBy(desc(quizzes.createdAt))
    return result.map(this.mapDbQuiz)
  }

  async create(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) {
    const code = await generateUniqueQuizCode()
    const [created] = await db
      .insert(quizzes)
      .values({ ...quiz, code })
      .returning()
    return this.mapDbQuiz(created)
  }

  async update(quizId: number, userId: string, update: Partial<Quiz>) {
    const allowed: any = { ...update }
    delete allowed.id
    delete allowed.createdAt
    delete allowed.updatedAt
    const [updated] = await db
      .update(quizzes)
      .set(allowed)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.createdBy, userId)))
      .returning()
    return updated ? this.mapDbQuiz(updated) : null
  }

  async deleteQuiz(quizId: number, userId: string) {
    const deleted = await db
      .delete(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.createdBy, userId)))
      .returning()
    return !!deleted.length
  }

  async updateIsPublic(quizId: number, userId: string, isPublic: boolean) {
    const [updated] = await db
      .update(quizzes)
      .set({ isPublic })
      .where(and(eq(quizzes.id, quizId), eq(quizzes.createdBy, userId)))
      .returning()
    return updated ? this.mapDbQuiz(updated) : null
  }

  async findRandomPublic(limit: number = 10) {
    try {
      const idsSet = new Set<string>()
      for (let i = 0; i < limit * 2 && idsSet.size < limit; i++) {
        const idRaw = await this.redis.sRandMember(this.REDIS_KEY)
        if (typeof idRaw === 'string') idsSet.add(idRaw)
      }
      let ids = Array.from(idsSet)
      if (ids.length < limit) {
        await this.refreshPublicQuizIds()
        idsSet.clear()
        for (let i = 0; i < limit * 2 && idsSet.size < limit; i++) {
          const idRaw = await this.redis.sRandMember(this.REDIS_KEY)
          if (typeof idRaw === 'string') idsSet.add(idRaw)
        }
        ids = Array.from(idsSet)
      }
      if (ids.length === 0) return []
      const idNums = ids.map(Number)
      const result = await db.select().from(quizzes).where(inArray(quizzes.id, idNums))
      return this.shuffleArray(result).map(this.mapDbQuiz)
    } catch {
      const publicQuizIds = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.isPublic, true))
      if (publicQuizIds.length === 0) return []
      const randomIds = this.shuffleArray(publicQuizIds)
        .slice(0, Math.min(limit, publicQuizIds.length))
        .map((item) => item.id)
      const result = await db.select().from(quizzes).where(inArray(quizzes.id, randomIds))
      return this.shuffleArray(result).map(this.mapDbQuiz)
    }
  }

  private async refreshPublicQuizIds() {
    const ids = await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.isPublic, true))
    if (ids.length > 0) {
      await this.redis.del(this.REDIS_KEY)
      const idStrings = ids.map((item) => String(item.id))
      if (idStrings.length > 0) {
        await this.redis.sAdd(this.REDIS_KEY, idStrings)
      }
      await this.redis.expire(this.REDIS_KEY, this.CACHE_TTL)
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
