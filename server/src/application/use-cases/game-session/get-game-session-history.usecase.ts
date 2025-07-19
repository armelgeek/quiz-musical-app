import type { GameSession } from '../../../domain/models/game-session.model'
import type { GameSessionRepositoryInterface } from '../../../domain/repositories/game-session.repository.interface'

export class GetGameSessionHistoryUseCase {
  constructor(private gameSessionRepo: GameSessionRepositoryInterface) {}

  async execute(userId: number): Promise<{ success: boolean; sessions: GameSession[] }> {
    const sessions = await this.gameSessionRepo.findAllByUser(userId)
    return { success: true, sessions }
  }
}
