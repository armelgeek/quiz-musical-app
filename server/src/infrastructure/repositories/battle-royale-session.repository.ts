import { eq } from 'drizzle-orm'
import type { BattleRoyaleSession } from '@/domain/models/battle-royale-session.model'
import type { BattleRoyaleSessionRepositoryInterface } from '@/domain/repositories/battle-royale-session.repository.interface'
import { db } from '../database/db'
import { battleRoyaleSessions } from '../database/schema/battle-royale-session'
export class BattleRoyaleSessionRepository implements BattleRoyaleSessionRepositoryInterface {
  async create(session: Omit<BattleRoyaleSession, 'id'>): Promise<BattleRoyaleSession> {
    const [row] = await db
      .insert(battleRoyaleSessions)
      .values({
        userId: String(session.userId),
        mode: session.mode,
        round: session.round,
        players: JSON.stringify(session.players),
        quizzes: JSON.stringify(session.quizzes),
        status: session.status,
        startedAt: session.startedAt ? new Date(session.startedAt) : undefined,
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        eliminatedUserIds: JSON.stringify(session.eliminatedUserIds),
        currentQuestionIndex: session.currentQuestionIndex,
        winnerUserId: session.winnerUserId ?? null
      })
      .returning()
    return this.mapRowToModel(row)
  }

  async findById(id: number): Promise<BattleRoyaleSession | null> {
    const rows = await db.select().from(battleRoyaleSessions).where(eq(battleRoyaleSessions.id, id)).limit(1)
    if (!rows[0]) return null
    return this.mapRowToModel(rows[0])
  }

  async list(): Promise<BattleRoyaleSession[]> {
    const rows = await db.select().from(battleRoyaleSessions)
    return rows.map(this.mapRowToModel)
  }

  async update(id: number, data: Partial<BattleRoyaleSession>): Promise<BattleRoyaleSession | null> {
    // Adapter userId si présent
    const updateData: any = {}
    if (data.userId !== undefined) updateData.userId = String(data.userId)
    if (data.mode !== undefined) updateData.mode = data.mode
    if (data.round !== undefined) updateData.round = data.round
    if (data.players !== undefined) updateData.players = JSON.stringify(data.players)
    if (data.quizzes !== undefined) updateData.quizzes = JSON.stringify(data.quizzes)
    if (data.status !== undefined) updateData.status = data.status
    if (data.startedAt !== undefined) updateData.startedAt = data.startedAt ? new Date(data.startedAt) : undefined
    if (data.endedAt !== undefined) updateData.endedAt = data.endedAt ? new Date(data.endedAt) : undefined
    if (data.eliminatedUserIds !== undefined) updateData.eliminatedUserIds = JSON.stringify(data.eliminatedUserIds)
    if (data.currentQuestionIndex !== undefined) updateData.currentQuestionIndex = data.currentQuestionIndex
    if (data.winnerUserId !== undefined) updateData.winnerUserId = data.winnerUserId
    const [row] = await db
      .update(battleRoyaleSessions)
      .set(updateData)
      .where(eq(battleRoyaleSessions.id, id))
      .returning()
    return row ? this.mapRowToModel(row) : null
  }

  async addPlayer(sessionId: number, userId: string): Promise<BattleRoyaleSession | null> {
    const session = await this.findById(sessionId)
    if (!session) return null
    if (!session.players.some((p) => p.userId === userId)) {
      session.players.push({ userId, isActive: true, score: 0 })
      await this.update(sessionId, { players: session.players })
    }
    return this.findById(sessionId)
  }

  async eliminatePlayer(sessionId: number, userId: string, round: number): Promise<BattleRoyaleSession | null> {
    const session = await this.findById(sessionId)
    if (!session) return null
    const player = session.players.find((p) => p.userId === userId)
    if (player) {
      player.isActive = false
      player.eliminatedAtRound = round
      session.eliminatedUserIds.push(userId)
      await this.update(sessionId, {
        players: session.players,
        eliminatedUserIds: session.eliminatedUserIds
      })
    }
    return this.findById(sessionId)
  }

  async nextRound(sessionId: number): Promise<BattleRoyaleSession | null> {
    const session = await this.findById(sessionId)
    if (!session) return null
    session.round += 1
    if (session.players.filter((p) => p.isActive).length > 1) {
      const activePlayers = session.players.filter((p) => p.isActive)
      // const scores = activePlayers.map((p) => p.score)
      const threshold = Math.ceil(activePlayers.length * 0.2) || 1
      const toEliminate = activePlayers.sort((a, b) => a.score - b.score).slice(0, threshold)
      toEliminate.forEach((player) => {
        player.isActive = false
        player.eliminatedAtRound = session.round
        session.eliminatedUserIds.push(player.userId)
      })
      await this.update(sessionId, {
        players: session.players,
        eliminatedUserIds: session.eliminatedUserIds,
        round: session.round
      })
    } else {
      await this.update(sessionId, { round: session.round })
    }
    return this.findById(sessionId)
  }

  async setWinner(sessionId: number, userId: string): Promise<BattleRoyaleSession | null> {
    await this.update(sessionId, { winnerUserId: userId })
    return this.findById(sessionId)
  }

  private mapRowToModel(row: any): BattleRoyaleSession {
    return {
      ...row,
      id: Number(row.id),
      userId: Number(row.userId),
      players: Array.isArray(row.players) ? row.players : JSON.parse(row.players ?? '[]'),
      quizzes: Array.isArray(row.quizzes) ? row.quizzes : JSON.parse(row.quizzes ?? '[]'),
      eliminatedUserIds: Array.isArray(row.eliminatedUserIds)
        ? row.eliminatedUserIds
        : JSON.parse(row.eliminatedUserIds ?? '[]')
    }
  }
}
