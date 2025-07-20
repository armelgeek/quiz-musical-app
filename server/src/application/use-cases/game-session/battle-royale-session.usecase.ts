import { emitBadgeBroadcast, emitBadgeNotification } from '@/infrastructure/ws/notification.ws'

import type { BattleRoyaleSessionRepositoryInterface } from '@/domain/repositories/battle-royale-session.repository.interface'
import type { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface'
import type { BadgeRepository } from '@/infrastructure/repositories/badge.repository'

export class BattleRoyaleSessionUseCase {
  constructor(
    private brSessionRepo: BattleRoyaleSessionRepositoryInterface,
    private userRepository: UserRepositoryInterface,
    private badgeRepository: BadgeRepository
  ) {}

  joinSession(sessionId: number, userId: string) {
    return this.brSessionRepo.addPlayer(sessionId, userId)
  }

  startNextRound(sessionId: number) {
    // Avance le round, élimine les plus lents, met à jour la session
    return this.brSessionRepo.nextRound(sessionId)
  }

  eliminatePlayer(sessionId: number, userId: string, round: number) {
    return this.brSessionRepo.eliminatePlayer(sessionId, userId, round)
  }

  async setWinner(sessionId: number, userId: string, bonusXp = 1000) {
    // Marque le vainqueur, attribue badge + bonus XP
    const session = await this.brSessionRepo.setWinner(sessionId, userId)
    if (!session) return null
    const user = await this.userRepository.findById(userId)
    if (user) {
      const newXp = (typeof user.xp === 'string' ? Number.parseInt(user.xp, 10) : user.xp || 0) + bonusXp
      await this.userRepository.update(userId, { xp: newXp })
    }
    // Badge spécial
    const brBadgeId = 'battle_royale_winner'
    const brBadge = await this.badgeRepository.getBadgeById(brBadgeId)
    if (brBadge) {
      const hasBrBadge = await this.badgeRepository.hasUserBadge(userId, brBadgeId)
      if (!hasBrBadge) {
        const awarded = await this.badgeRepository.awardBadgeToUser(userId, brBadgeId)
        emitBadgeNotification(userId, awarded)
        emitBadgeBroadcast(userId, user?.firstname || userId, awarded)
      }
    }
    return session
  }
}
