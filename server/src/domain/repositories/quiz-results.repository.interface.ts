export interface QuizResultsRepositoryInterface {
  getLeaderboard: (
    period: 'all' | 'day' | 'week' | 'month',
    limit?: number
  ) => Promise<{ userId: string; totalScore: number }[]>
  getPodiumOfDay: () => Promise<{ userId: string; totalScore: number }[]>
}
