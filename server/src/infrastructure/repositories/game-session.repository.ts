
import { db } from '../database/db'
import { gameSessions } from '../database/schema/game-session'
import { eq, and } from 'drizzle-orm'
import type { GameSession } from '../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../domain/repositories/game-session.repository.interface'
import type { Quiz } from '../../domain/models/quiz.model'

export class GameSessionRepository implements GameSessionRepositoryInterface {
  async create(userId: number, quizzes: Quiz[]): Promise<GameSession> {
    const [created] = await db
      .insert(gameSessions)
      .values({
        userId,
        quizzes,
        status: 'active'
      })
      .returning()
    return {
      id: created.id,
      userId: created.userId,
      quizzes: created.quizzes as Quiz[],
      status: created.status as 'active' | 'completed',
      startedAt: created.startedAt ? new Date(created.startedAt).toISOString() : '',
      endedAt: created.endedAt ? new Date(created.endedAt).toISOString() : undefined
    }
  }

  async findActiveByUser(userId: number): Promise<GameSession | null> {
    const result = await db
      .select()
      .from(gameSessions)
      .where(and(eq(gameSessions.userId, userId), eq(gameSessions.status, 'active')))
    if (!result.length) return null
    const session = result[0]
    return {
      id: session.id,
      userId: session.userId,
      quizzes: session.quizzes as Quiz[],
      status: session.status as 'active' | 'completed',
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : '',
      endedAt: session.endedAt ? new Date(session.endedAt).toISOString() : undefined
    }
  }

  async complete(sessionId: number): Promise<GameSession | null> {
    const [updated] = await db
      .update(gameSessions)
      .set({ status: 'completed', endedAt: new Date() })
      .where(eq(gameSessions.id, sessionId))
      .returning()
    if (!updated) return null
    return {
      id: updated.id,
      userId: updated.userId,
      quizzes: updated.quizzes as Quiz[],
      status: updated.status as 'active' | 'completed',
      startedAt: updated.startedAt ? new Date(updated.startedAt).toISOString() : '',
      endedAt: updated.endedAt ? new Date(updated.endedAt).toISOString() : undefined
    }
  }

  async findById(sessionId: number): Promise<GameSession | null> {
    const result = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId))
    if (!result.length) return null
    const session = result[0]
    return {
      id: session.id,
      userId: session.userId,
      quizzes: session.quizzes as Quiz[],
      status: session.status as 'active' | 'completed',
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : '',
      endedAt: session.endedAt ? new Date(session.endedAt).toISOString() : undefined
    }
  }

  async findAllByUser(userId: number): Promise<GameSession[]> {
    const result = await db.select().from(gameSessions).where(eq(gameSessions.userId, userId))
    return result.map(session => ({
      id: session.id,
      userId: session.userId,
      quizzes: session.quizzes as Quiz[],
      status: session.status as 'active' | 'completed',
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : '',
      endedAt: session.endedAt ? new Date(session.endedAt).toISOString() : undefined
    }))
  }
}
