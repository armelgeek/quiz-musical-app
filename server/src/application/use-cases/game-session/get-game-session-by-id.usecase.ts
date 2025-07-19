import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'

export class GetGameSessionByIdUseCase {
  constructor(private gameSessionRepo: GameSessionRepositoryInterface) {}

  async execute(sessionId: number): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const session = await this.gameSessionRepo.findById(sessionId)
    if (!session) return { success: false, error: 'Session not found' }
    return { success: true, session }
  }
}
