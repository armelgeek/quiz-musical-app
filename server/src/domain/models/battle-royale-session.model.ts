import type { GameSession } from './game-session.model'

export interface BattleRoyaleSession extends GameSession {
  mode: 'battle_royale'
  round: number
  players: Array<{
    userId: string
    isActive: boolean
    score: number
    eliminatedAtRound?: number
  }>
  currentQuestionIndex: number
  eliminatedUserIds: string[]
  winnerUserId?: string
}
