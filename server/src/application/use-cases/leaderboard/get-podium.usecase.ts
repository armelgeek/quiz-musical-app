import type { QuizResultsRepositoryInterface } from '@/domain/repositories/quiz-results.repository.interface'

export class GetPodiumUseCase {
  constructor(private readonly repo: QuizResultsRepositoryInterface) {}

  execute() {
    return this.repo.getPodiumOfDay()
  }
}
