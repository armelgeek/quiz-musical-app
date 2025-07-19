import type { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface'
import type { BadgeRepository } from '@/infrastructure/repositories/badge.repository'
import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'

export class CompleteGameSessionUseCase {
  constructor(
    private gameSessionRepo: GameSessionRepositoryInterface,
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepositoryInterface
  ) {}

  /**
   * Completes a game session and awards badges:
   * - 'first_win' for first completion
   * - Score-based badges (e.g., 'score_100', 'score_200', ...)
   * Returns { success, session, badgesAwarded? }
   */
  async execute(
    sessionId: number
  ): Promise<{ success: boolean; session?: GameSession; error?: string; badgesAwarded?: any[] }> {
    const session = await this.gameSessionRepo.complete(sessionId)
    if (!session) return { success: false, error: 'Session not found or already completed' }

    const userId = String(session.userId)
    const badgesAwarded: any[] = []

    // --- 1. First win badge ---
    const firstWinBadgeId = 'first_win'
    const firstWinBadge = await this.badgeRepository.getBadgeById(firstWinBadgeId)
    if (firstWinBadge) {
      const hasFirstWin = await this.badgeRepository.hasUserBadge(userId, firstWinBadgeId)
      if (!hasFirstWin) {
        const awarded = await this.badgeRepository.awardBadgeToUser(userId, firstWinBadgeId)
        badgesAwarded.push(awarded)
      }
    }

    // --- 2. Score-based badges ---
    // Define your badge thresholds and IDs here
    const scoreBadgeThresholds = [
      { id: 'score_100', min: 100 },
      { id: 'score_200', min: 200 },
      { id: 'score_300', min: 300 },
      { id: 'score_500', min: 500 },
      { id: 'score_1000', min: 1000 }
    ]

    // You need to get the user's score for this session. Assume session has a 'score' property, otherwise fetch from results repo.
    // If not present, set to 0.
    // TODO: Replace with actual score retrieval if needed.
    const sessionScore = (session as any).score ?? 0

    for (const badgeInfo of scoreBadgeThresholds) {
      if (sessionScore >= badgeInfo.min) {
        const badge = await this.badgeRepository.getBadgeById(badgeInfo.id)
        if (badge) {
          const hasBadge = await this.badgeRepository.hasUserBadge(userId, badgeInfo.id)
          if (!hasBadge) {
            const awarded = await this.badgeRepository.awardBadgeToUser(userId, badgeInfo.id)
            badgesAwarded.push(awarded)
          }
        }
      }
    }

    return { success: true, session, badgesAwarded }
  }
}
