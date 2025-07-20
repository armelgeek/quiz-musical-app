import { fetchData } from '@/shared/domain/base.service';

export interface TopXpUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  rank: string;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export class UserLeaderboardService {
  async getTopXpUsers(): Promise<TopXpUser[]> {
    const res = await fetchData<{ success: boolean; users: TopXpUser[] }>('/users/top-xp', { method: 'GET' });
    if (!res.success) throw new Error('Erreur API leaderboard XP');
    return res.users;
  }
}

export const userLeaderboardService = new UserLeaderboardService();
