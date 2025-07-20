/* eslint-disable @typescript-eslint/ban-ts-comment */
import { API_ENDPOINTS } from '@/shared/config/api'
import BaseService from '@/shared/lib/services/base-service'
export interface Achievement {
  id: string
  name: string
}

export interface UserStats {
  userId: string
  quizzesCompleted: number
  achievements: Achievement[]
}

class UserStatsService extends BaseService {
  async getUserStats(): Promise<UserStats> {
    const res = await this.get(API_ENDPOINTS.stats.user)
    //@ts-expect-error
    if (!res.success) throw new Error(res.error || 'Erreur lors de la récupération des stats')
    return res.data as UserStats
  }
}

export const userStatsService = new UserStatsService()
