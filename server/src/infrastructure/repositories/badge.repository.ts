import { and, eq } from 'drizzle-orm'
import type { BadgeType, UserBadgeType } from '@/domain/models/badge.model'
import { db } from '../database/db'
import { badges, userBadges } from '../database/schema/badge'

export class BadgeRepository {
  constructor() {}

  async createBadge(badge: Omit<BadgeType, 'createdAt' | 'updatedAt'>): Promise<BadgeType> {
    const [created] = await db.insert(badges).values(badge).returning()
    return {
      ...created,
      icon: created.icon ?? undefined,
      createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : created.createdAt,
      updatedAt: created.updatedAt instanceof Date ? created.updatedAt.toISOString() : created.updatedAt
    }
  }

  async getAllBadges(): Promise<BadgeType[]> {
    const result = await db.select().from(badges)
    return result.map((b) => ({
      ...b,
      icon: b.icon ?? undefined,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
      updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt
    }))
  }

  async getBadgeById(id: string): Promise<BadgeType | null> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id))
    if (!badge) return null
    return {
      ...badge,
      icon: badge.icon ?? undefined,
      createdAt: badge.createdAt instanceof Date ? badge.createdAt.toISOString() : badge.createdAt,
      updatedAt: badge.updatedAt instanceof Date ? badge.updatedAt.toISOString() : badge.updatedAt
    }
  }

  async awardBadgeToUser(userId: string, badgeId: string): Promise<UserBadgeType> {
    const [userBadge] = await db.insert(userBadges).values({ userId, badgeId }).returning()
    return {
      ...userBadge,
      awardedAt: userBadge.awardedAt instanceof Date ? userBadge.awardedAt.toISOString() : userBadge.awardedAt
    }
  }

  async getUserBadges(userId: string): Promise<UserBadgeType[]> {
    const rows = await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        awardedAt: userBadges.awardedAt,
        badge_id: badges.id,
        badge_name: badges.name,
        badge_description: badges.description,
        badge_icon: badges.icon,
        badge_createdAt: badges.createdAt,
        badge_updatedAt: badges.updatedAt
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      badgeId: row.badgeId,
      awardedAt: row.awardedAt instanceof Date ? row.awardedAt.toISOString() : row.awardedAt,
      badge: row.badge_id
        ? {
            id: row.badge_id,
            name: row.badge_name ?? '',
            description: row.badge_description ?? '',
            icon: row.badge_icon ?? undefined,
            createdAt:
              row.badge_createdAt instanceof Date ? row.badge_createdAt.toISOString() : (row.badge_createdAt ?? ''),
            updatedAt:
              row.badge_updatedAt instanceof Date ? row.badge_updatedAt.toISOString() : (row.badge_updatedAt ?? '')
          }
        : undefined
    }))
  }

  async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
    return result.length > 0
  }
}
