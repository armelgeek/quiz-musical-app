import { useQuery } from '@tanstack/react-query'
import { userStatsService } from '../user-stats.service'

export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: () => userStatsService.getUserStats(),
  })
}
