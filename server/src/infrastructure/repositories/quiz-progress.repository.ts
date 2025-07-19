import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import { quizProgress } from '../database/schema/quiz'
import type { QuizProgress, QuizProgressRepository } from '../../domain/repositories/quiz-progress.repository.interface'

export class DrizzleQuizProgressRepository implements QuizProgressRepository {
  async findByUserAndQuiz(userId: string, quizId: number): Promise<QuizProgress | null> {
    const result = await db
      .select()
      .from(quizProgress)
      .where(and(eq(quizProgress.userId, userId), eq(quizProgress.quizId, quizId)))
      .limit(1)
    if (!result[0]) return null
    const row = result[0]
    return {
      ...row,
      currentQuestion: row.currentQuestion ?? 0,
      selectedAnswers: (() => {
        if (typeof row.selectedAnswers === 'object' && row.selectedAnswers !== null) {
          return row.selectedAnswers as Record<string, string>;
        } else {
          const emptyAnswers: Record<string, string> = {};
          return emptyAnswers;
        }
      })(),
      timeLeft: row.timeLeft ?? 0,
      updatedAt: row.updatedAt ?? undefined
    }
  }

  async saveOrUpdate(data: QuizProgress): Promise<QuizProgress> {
    const existing = await this.findByUserAndQuiz(data.userId, data.quizId)
    if (existing) {
      await db
        .update(quizProgress)
        .set({
          currentQuestion: data.currentQuestion,
          selectedAnswers: data.selectedAnswers,
          timeLeft: data.timeLeft,
          updatedAt: new Date()
        })
        .where(and(eq(quizProgress.userId, data.userId), eq(quizProgress.quizId, data.quizId)))
      return { ...existing, ...data, updatedAt: new Date() }
    } else {
      const inserted = await db
        .insert(quizProgress)
        .values({
          userId: data.userId,
          quizId: data.quizId,
          currentQuestion: data.currentQuestion,
          selectedAnswers: data.selectedAnswers,
          timeLeft: data.timeLeft
        })
        .returning()
      const row = inserted[0]
      return {
        ...row,
        currentQuestion: row.currentQuestion ?? 0,
        selectedAnswers:
          typeof row.selectedAnswers === 'object' && row.selectedAnswers !== null
            ? (row.selectedAnswers as Record<string, string>)
            : ({} satisfies Record<string, string>),
        timeLeft: row.timeLeft ?? 0,
        updatedAt: row.updatedAt ?? undefined
      }
    }
  }

  async deleteByUserAndQuiz(userId: string, quizId: number): Promise<void> {
    await db.delete(quizProgress).where(and(eq(quizProgress.userId, userId), eq(quizProgress.quizId, quizId)))
  }
}
