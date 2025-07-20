import type { UserBadgeType } from '../models/badge.model'

export interface UserStats {
  userId: string
  quizzesCompleted: number
  achievements: UserBadgeType[]
}

export interface UserStatsRepositoryInterface {
  getUserStats: (userId: string) => Promise<UserStats>
}
