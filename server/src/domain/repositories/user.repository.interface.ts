import type { User } from '../models/user.model'
import type { z } from 'zod'

export interface UserRepositoryInterface {
  findById: (id: string) => Promise<z.infer<typeof User> | null>
  findByEmail: (email: string) => Promise<z.infer<typeof User> | null>
  findAll: (
    page?: number,
    limit?: number
  ) => Promise<{ items: z.infer<typeof User>[]; total: number; page: number; limit: number; totalPages: number }>
  save: (user: z.infer<typeof User>) => Promise<z.infer<typeof User>>
  update: (id: string, data: Partial<z.infer<typeof User>>) => Promise<z.infer<typeof User> | null>
  remove: (id: string) => Promise<boolean>
  findTopByXp: (limit?: number) => Promise<z.infer<typeof User>[]>
}
