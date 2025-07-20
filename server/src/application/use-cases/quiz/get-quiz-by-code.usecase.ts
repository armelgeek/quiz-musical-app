import type { Quiz } from '@/domain/models/quiz.model'
import type { QuizRepositoryInterface } from '@/domain/repositories/quiz.repository.interface'

export class GetQuizByCodeUseCase {
  constructor(private readonly quizRepository: QuizRepositoryInterface) {}

  execute(code: string): Promise<Quiz | null> {
    return this.quizRepository.findByCode(code)
  }
}
