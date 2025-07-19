import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import { multiplayerPlayers, multiplayerSessions } from '../database/schema/multiplayer'

export class MultiplayerRepository {
  async createSession(questions: any[]) {
    const [session] = await db.insert(multiplayerSessions).values({ questions }).returning()
    return session
  }

  listWaitingSessions() {
    return db.select().from(multiplayerSessions).where(eq(multiplayerSessions.status, 'waiting'))
  }

  async joinSession(sessionId: number, userId: string) {
    const [player] = await db.insert(multiplayerPlayers).values({ sessionId, userId }).returning()
    return player
  }

  listPlayers(sessionId: number) {
    return db.select().from(multiplayerPlayers).where(eq(multiplayerPlayers.sessionId, sessionId))
  }

  async setPlayerReady(sessionId: number, userId: string) {
    await db
      .update(multiplayerPlayers)
      .set({ isReady: true })
      .where(and(eq(multiplayerPlayers.sessionId, sessionId), eq(multiplayerPlayers.userId, userId)))
  }

  async startSession(sessionId: number) {
    await db
      .update(multiplayerSessions)
      .set({ status: 'started', startedAt: new Date() })
      .where(eq(multiplayerSessions.id, sessionId))
  }

  getSession(sessionId: number) {
    return db
      .select()
      .from(multiplayerSessions)
      .where(eq(multiplayerSessions.id, sessionId))
      .then((r) => r[0])
  }
}
