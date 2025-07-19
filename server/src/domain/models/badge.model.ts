import { z } from 'zod'

export const Badge = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date())
})

export const UserBadge = z.object({
  id: z.number(),
  userId: z.string(),
  badgeId: z.string(),
  awardedAt: z.string().or(z.date()),
  badge: Badge.optional() // for population
})

export type BadgeType = z.infer<typeof Badge>
export type UserBadgeType = z.infer<typeof UserBadge>
