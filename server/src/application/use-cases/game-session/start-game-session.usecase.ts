import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'
import type { QuizRepositoryInterface } from '../../../domain/repositories/quiz.repository.interface'

export class StartGameSessionUseCase {
  constructor(
    private gameSessionRepo: GameSessionRepositoryInterface,
    private quizRepo: QuizRepositoryInterface
  ) {}

  async execute(
    userId: number,
    quizCount: number = 5
  ): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const selected = await this.quizRepo.findRandomPublic(quizCount)
    if (selected.length < quizCount) {
      return { success: false, error: 'Not enough quizzes available' }
    }
    const session = await this.gameSessionRepo.create(userId, selected)
    return { success: true, session }
  }
}
