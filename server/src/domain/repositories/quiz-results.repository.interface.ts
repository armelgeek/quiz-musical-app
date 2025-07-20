export interface QuizResult {
  userId: string
  quizId: string
  score: number
  passed: boolean
  completedAt: Date
  title: string
  passingScore: number
  code: string
  maxScore: number
  subject: string
  topic: string
  duration: string
  selectedAnswers: Record<string, string>
  timeLeft: number
  updatedAt: Date
}

export interface QuizResultsRepositoryInterface {
  saveQuizResult: (
    userId: string,
    result: Omit<QuizResult, 'userId' | 'updatedAt' | 'completedAt'>
  ) => Promise<QuizResult>
  getQuizResultsByUser: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<{ items: QuizResult[]; total: number; page: number; limit: number; totalPages: number }>

  getQuizResultsByCode: (code: string) => Promise<QuizResult | null>

  getLeaderboard: (
    period: 'all' | 'day' | 'week' | 'month',
    limit?: number
  ) => Promise<{ userId: string; totalScore: number; user: { name: string; image: string | null } }[]>
  getPodiumOfDay: () => Promise<{ userId: string; totalScore: number; user: { name: string; image: string | null } }[]>
}
