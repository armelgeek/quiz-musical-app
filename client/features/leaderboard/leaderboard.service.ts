import { fetchData } from '@/shared/domain/base.service';
export interface LeaderboardUser {
  userId: string;
  totalScore: number;
  user: {
    name: string;
    image: string | null;
  };
}

export class LeaderboardService {
  getPodium = async (): Promise<LeaderboardUser[]> => {
    const res = await fetchData<{ success: boolean; podium: LeaderboardUser[] }>('/leaderboard/podium', { method: 'GET' });
    if (!res.success) throw new Error('Erreur API podium');
    return res.podium;
  };

  getLeaderboard = async (
    period: 'all' | 'day' | 'week' | 'month' = 'all',
    page = 1,
    limit = 5
  ): Promise<{ items: LeaderboardUser[]; totalPages: number; limit: number }> => {
    const res = await fetchData<{
      success: boolean;
      leaderboard: LeaderboardUser[];
      totalPages?: number;
      limit?: number;
    }>(`/leaderboard?period=${period}&page=${page}&limit=${limit}`, { method: 'GET' });
    if (!res.success) throw new Error('Erreur API leaderboard');
    return {
      items: res.leaderboard,
      totalPages: res.totalPages || 1,
      limit: res.limit || limit,
    };
  };
}



export const leaderboardService = new LeaderboardService();
