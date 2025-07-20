import { useQuery } from '@tanstack/react-query';
import { userLeaderboardService, TopXpUser } from '../user-leaderboard.service';

export function useUserLeaderboard() {
  return useQuery<TopXpUser[], Error>({
    queryKey: ['user-top-xp'],
    queryFn: () => userLeaderboardService.getTopXpUsers(),
  });
}
