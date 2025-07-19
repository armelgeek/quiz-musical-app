import type { UserType } from '@/domain/models/user.model'
import type { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface'

export class GetTopUsersByXpUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(limit: number = 20) {
    try {
      const users = await this.userRepository.findTopByXp(limit)
      return { success: true, users }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class GetAllUsersUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(page: number = 1, limit: number = 10) {
    try {
      const result = await this.userRepository.findAll(page, limit)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(id: string) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class GetUserByEmailUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email)
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(id: string, data: Partial<UserType>) {
    try {
      const user = await this.userRepository.update(id, data)
      if (!user) {
        return { success: false, error: 'User not found or update failed' }
      }
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepositoryInterface) { }

  async execute(id: string) {
    try {
      const deleted = await this.userRepository.remove(id)
      if (!deleted) {
        return { success: false, error: 'User not found or deletion failed' }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
