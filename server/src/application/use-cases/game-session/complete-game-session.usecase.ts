import { emitBadgeBroadcast, emitBadgeNotification } from '@/infrastructure/ws/notification.ws'
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
    sessionId: number,
    options?: { isBattleRoyaleWinner?: boolean; battleRoyaleBonusXp?: number; challengeId?: string }
  ): Promise<{
    success: boolean
    session?: GameSession
    error?: string
    badgesAwarded?: any[]
    bonusAwarded?: number
    challengeCompleted?: boolean
  }> {
    // 1. Complétion de la session
    const session = await this.gameSessionRepo.complete(sessionId)
    if (!session) return { success: false, error: 'Session not found or already completed' }

    const userId = String(session.userId)
    const badgesAwarded: any[] = []
    let bonusAwarded = 0
    const challengeCompleted = false

    // Récupération du user (pour XP)
    let user = await this.userRepository.findById(userId)
    let username = userId
    if (user && user.firstname) username = user.firstname

    // --- 0. Battle Royale Winner ---
    if (options?.isBattleRoyaleWinner) {
      // Badge spécial
      const brBadgeId = 'battle_royale_winner'
      const brBadge = await this.badgeRepository.getBadgeById(brBadgeId)
      if (brBadge) {
        const hasBrBadge = await this.badgeRepository.hasUserBadge(userId, brBadgeId)
        if (!hasBrBadge) {
          const awarded = await this.badgeRepository.awardBadgeToUser(userId, brBadgeId)
          badgesAwarded.push(awarded)
          emitBadgeNotification(userId, awarded)
          emitBadgeBroadcast(userId, username, awarded)
        }
      }
      // Bonus XP
      const bonus = options?.battleRoyaleBonusXp ?? 1000
      if (user) {
        const newXp = (typeof user.xp === 'string' ? Number.parseInt(user.xp, 10) : user.xp || 0) + bonus
        await this.userRepository.update(userId, { xp: newXp })
        bonusAwarded = bonus
        user = await this.userRepository.findById(userId) // refresh
      }
    }

    // --- 1. First win badge ---
    const firstWinBadgeId = 'first_win'
    const firstWinBadge = await this.badgeRepository.getBadgeById(firstWinBadgeId)
    if (firstWinBadge) {
      const hasFirstWin = await this.badgeRepository.hasUserBadge(userId, firstWinBadgeId)
      if (!hasFirstWin) {
        const awarded = await this.badgeRepository.awardBadgeToUser(userId, firstWinBadgeId)
        badgesAwarded.push(awarded)
        emitBadgeNotification(userId, awarded)
        emitBadgeBroadcast(userId, username, awarded)
      }
    }

    // --- 2. Score-based badges ---
    const scoreBadgeThresholds = [
      { id: 'score_100', min: 100 },
      { id: 'score_200', min: 200 },
      { id: 'score_300', min: 300 },
      { id: 'score_500', min: 500 },
      { id: 'score_1000', min: 1000 }
    ]
    const sessionScore = (session as any).score ?? 0
    for (const badgeInfo of scoreBadgeThresholds) {
      if (sessionScore >= badgeInfo.min) {
        const badge = await this.badgeRepository.getBadgeById(badgeInfo.id)
        if (badge) {
          const hasBadge = await this.badgeRepository.hasUserBadge(userId, badgeInfo.id)
          if (!hasBadge) {
            const awarded = await this.badgeRepository.awardBadgeToUser(userId, badgeInfo.id)
            badgesAwarded.push(awarded)
            emitBadgeNotification(userId, awarded)
            emitBadgeBroadcast(userId, username, awarded)
          }
        }
      }
    }

    // --- 3. Défis hebdomadaires (hook) ---
    if (options?.challengeId) {
      // TODO: intégrer la logique de validation de défi, attribution badge rare, etc.
      // challengeCompleted = await this.challengeService.completeChallenge(userId, options.challengeId)
      // if (challengeCompleted) { ...attribuer badge rare... }
    }

    return { success: true, session, badgesAwarded, bonusAwarded, challengeCompleted }
  }
}
