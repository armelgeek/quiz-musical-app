import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'

export class GetActiveGameSessionUseCase {
  constructor(private gameSessionRepo: GameSessionRepositoryInterface) {}

  async execute(userId: number): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const session = await this.gameSessionRepo.findActiveByUser(userId)
    if (!session) return { success: false, error: 'No active session' }
    return { success: true, session }
  }
}
