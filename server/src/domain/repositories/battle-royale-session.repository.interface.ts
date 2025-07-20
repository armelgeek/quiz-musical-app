import type { BattleRoyaleSession } from '../models/battle-royale-session.model'

export interface BattleRoyaleSessionRepositoryInterface {
  create: (session: Omit<BattleRoyaleSession, 'id'>) => Promise<BattleRoyaleSession>
  findById: (id: number) => Promise<BattleRoyaleSession | null>
  update: (id: number, data: Partial<BattleRoyaleSession>) => Promise<BattleRoyaleSession | null>
  addPlayer: (sessionId: number, userId: string) => Promise<BattleRoyaleSession | null>
  eliminatePlayer: (sessionId: number, userId: string, round: number) => Promise<BattleRoyaleSession | null>
  nextRound: (sessionId: number) => Promise<BattleRoyaleSession | null>
  setWinner: (sessionId: number, userId: string) => Promise<BattleRoyaleSession | null>
}
