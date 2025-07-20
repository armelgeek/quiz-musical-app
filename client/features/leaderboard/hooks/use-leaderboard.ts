import { useQuery } from '@tanstack/react-query';
import { leaderboardService, LeaderboardUser } from '../leaderboard.service';

export function usePodium() {
  return useQuery<LeaderboardUser[], Error>({
    queryKey: ['leaderboard-podium'],
    queryFn: () => leaderboardService.getPodium(),
  });
}

export function useLeaderboard(
  period: 'all' | 'day' | 'week' | 'month' = 'all',
  page = 1,
  limit = 5
) {
  return useQuery<{ items: LeaderboardUser[]; totalPages: number; limit: number }, Error>({
    queryKey: ['leaderboard', period, page, limit],
    queryFn: () => leaderboardService.getLeaderboard(period, page, limit),
  });
}
