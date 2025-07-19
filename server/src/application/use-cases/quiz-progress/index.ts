import type { QuizProgressRepository } from '@/domain/repositories/quiz-progress.repository.interface'

export class GetUserQuizProgressUseCase {
  constructor(private repo: QuizProgressRepository) {}
  execute(userId: string, quizId: number) {
    return this.repo.findByUserAndQuiz(userId, quizId)
  }
}

export class SaveUserQuizProgressUseCase {
  constructor(private repo: QuizProgressRepository) {}
  execute(data: {
    userId: string
    quizId: number
    currentQuestion: number
    selectedAnswers: Record<string, string>
    timeLeft: number
  }) {
    return this.repo.saveOrUpdate(data)
  }
}

export class DeleteUserQuizProgressUseCase {
  constructor(private repo: QuizProgressRepository) {}
  execute(userId: string, quizId: number) {
    return this.repo.deleteByUserAndQuiz(userId, quizId)
  }
}
