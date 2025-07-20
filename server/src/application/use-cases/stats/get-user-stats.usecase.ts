import type { UserStatsRepositoryInterface } from '@/domain/repositories/user-stats.repository.interface'

export class GetUserStatsUseCase {
  constructor(private readonly repo: UserStatsRepositoryInterface) {}

  execute(userId: string) {
    return this.repo.getUserStats(userId)
  }
}
