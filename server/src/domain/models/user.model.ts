import { z } from 'zod'
import { UserBadge } from './badge.model'

export const User = z.object({
  id: z.string(),
  name: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  isAdmin: z.boolean(),
  xp: z.string().or(z.number()).default('0'),
  rank: z.string().default('🥚 Brainy Beginnings'),
  level: z.number().default(1),
  favouriteTopic: z.string().optional(),
  badges: z.array(UserBadge).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
})

export type UserType = z.infer<typeof User>
