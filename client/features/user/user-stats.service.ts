import { API_ENDPOINTS } from '@/shared/config/api'
import BaseService from '@/shared/lib/services/base-service'
export interface UserStats {
  userId: string
  quizzesCompleted: number
  achievements: any[]
}

class UserStatsService extends BaseService {
  async getUserStats(): Promise<UserStats> {
    const res = await this.get(API_ENDPOINTS.stats.user)
    if (!res.success) throw new Error(res.error || 'Erreur lors de la récupération des stats')
    return res.data
  }
}

export const userStatsService = new UserStatsService()
