export interface QuizProgress {
  id?: number
  quizId: number
  userId: string
  currentQuestion: number
  selectedAnswers: Record<string, string>
  timeLeft: number
  updatedAt?: Date
}

export interface QuizProgressRepository {
  findByUserAndQuiz: (userId: string, quizId: number) => Promise<QuizProgress | null>
  saveOrUpdate: (data: QuizProgress) => Promise<QuizProgress>
  deleteByUserAndQuiz: (userId: string, quizId: number) => Promise<void>
}
