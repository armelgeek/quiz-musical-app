import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'

export class CompleteGameSessionUseCase {
  constructor(private gameSessionRepo: GameSessionRepositoryInterface) {}

  async execute(sessionId: number): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const session = await this.gameSessionRepo.complete(sessionId)
    if (!session) return { success: false, error: 'Session not found or already completed' }
    return { success: true, session }
  }
}
