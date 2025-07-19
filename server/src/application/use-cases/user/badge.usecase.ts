import type { BadgeType, UserBadgeType } from '@/domain/models/badge.model'
import type { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface'
import type { BadgeRepository } from '@/infrastructure/repositories/badge.repository'

export class AwardBadgeToUserUseCase {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(userId: string, badgeId: string) {
    // Optionally check if user exists
    const user = await this.userRepository.findById(userId)
    if (!user) return { success: false, error: 'User not found' }
    // Check if already has badge
    const hasBadge = await this.badgeRepository.hasUserBadge(userId, badgeId)
    if (hasBadge) return { success: false, error: 'User already has this badge' }
    // Award badge
    const userBadge = await this.badgeRepository.awardBadgeToUser(userId, badgeId)
    return { success: true, userBadge }
  }
}

export class GetUserBadgesUseCase {
  constructor(private badgeRepository: BadgeRepository) {}
  async execute(userId: string) {
    const badges = await this.badgeRepository.getUserBadges(userId)
    return { success: true, badges }
  }
}

export class GetAllBadgesUseCase {
  constructor(private badgeRepository: BadgeRepository) {}
  async execute() {
    const badges = await this.badgeRepository.getAllBadges()
    return { success: true, badges }
  }
}
