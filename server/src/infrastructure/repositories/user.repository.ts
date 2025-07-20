import { count, eq, sql } from 'drizzle-orm'
import type { UserType } from '@/domain/models/user.model'
import type { UserRepositoryInterface } from '@/domain/repositories/user.repository.interface'
import { db } from '../database/db'
import { users } from '../database/schema/auth'

export class UserRepository implements UserRepositoryInterface {
  async findById(id: string): Promise<UserType | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (!result.length) return null
    return {
      ...result[0],
      xp: typeof result[0].xp === 'string' ? Number.parseInt(result[0].xp, 10) : (result[0].xp ?? 0),
      rank: result[0].rank ?? '🥚 Brainy Beginnings',
      level: result[0].level ? Number(result[0].level) : 1,
      firstname: result[0].firstname || undefined,
      lastname: result[0].lastname || undefined,
      image: result[0].image || undefined,
      favouriteTopic: result[0].favouriteTopic || undefined,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString()
    }
  }

  async findByEmail(email: string): Promise<UserType | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!result.length) return null
    return {
      ...result[0],
      xp: typeof result[0].xp === 'string' ? Number.parseInt(result[0].xp, 10) : (result[0].xp ?? 0),
      rank: result[0].rank ?? '🥚 Brainy Beginnings',
      level: result[0].level ? Number(result[0].level) : 1,
      firstname: result[0].firstname || undefined,
      lastname: result[0].lastname || undefined,
      image: result[0].image || undefined,
      favouriteTopic: result[0].favouriteTopic || undefined,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString()
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: UserType[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit
    const [items, totalResult] = await Promise.all([
      db.select().from(users).limit(limit).offset(offset),
      db.select({ count: count() }).from(users)
    ])
    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)
    return {
      items: items.map((item) => ({
        ...item,
        xp: typeof item.xp === 'string' ? Number.parseInt(item.xp, 10) : (item.xp ?? 0),
        rank: item.rank ?? '🥚 Brainy Beginnings',
        level: item.level ? Number(item.level) : 1,
        firstname: item.firstname || undefined,
        lastname: item.lastname || undefined,
        image: item.image || undefined,
        favouriteTopic: item.favouriteTopic || undefined,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      })),
      total,
      page,
      limit,
      totalPages
    }
  }

  async save(user: UserType): Promise<UserType> {
    const userData = {
      ...user,
      xp: user.xp !== undefined ? String(user.xp) : '0',
      rank: user.rank ?? '🥚 Brainy Beginnings',
      level: user.level !== undefined ? String(user.level) : '1',
      firstname: user.firstname || null,
      lastname: user.lastname || null,
      image: user.image || null,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }
    const result = await db.insert(users).values(userData).returning()
    return {
      ...result[0],
      xp: typeof result[0].xp === 'string' ? Number.parseInt(result[0].xp, 10) : (result[0].xp ?? 0),
      rank: result[0].rank ?? '🥚 Brainy Beginnings',
      level: result[0].level ? Number(result[0].level) : 1,
      firstname: result[0].firstname || undefined,
      lastname: result[0].lastname || undefined,
      image: result[0].image || undefined,
      favouriteTopic: result[0].favouriteTopic || undefined,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString()
    }
  }

  async update(id: string, data: Partial<UserType>): Promise<UserType | null> {
    const updateData: any = {
      firstname: data.firstname || null,
      lastname: data.lastname || null,
      image: data.image || null,
      updatedAt: new Date()
    }
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified
    if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin
    if (data.xp !== undefined) updateData.xp = String(data.xp)
    if (data.rank !== undefined) updateData.rank = data.rank ?? '🥚 Brainy Beginnings'
    if (data.level !== undefined) updateData.level = String(data.level)
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning()
    if (!result.length) return null
    return {
      ...result[0],
      xp: typeof result[0].xp === 'string' ? Number.parseInt(result[0].xp, 10) : (result[0].xp ?? 0),
      rank: result[0].rank ?? '🥚 Brainy Beginnings',
      level: result[0].level ? Number(result[0].level) : 1,
      firstname: result[0].firstname || undefined,
      lastname: result[0].lastname || undefined,
      image: result[0].image || undefined,
      favouriteTopic: result[0].favouriteTopic || undefined,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString()
    }
  }

  async remove(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning()
    return result.length > 0
  }

  async findTopByXp(limit: number = 20): Promise<UserType[]> {
    const items = await db
      .select()
      .from(users)
      .orderBy(sql`CAST(${users.xp} AS INTEGER) DESC`)
      .limit(limit)
    return items.map((item) => ({
      ...item,
      xp: typeof item.xp === 'string' ? Number.parseInt(item.xp, 10) : (item.xp ?? 0),
      rank: item.rank ?? '🥚 Brainy Beginnings',
      level: item.level ? Number(item.level) : 1,
      firstname: item.firstname || undefined,
      lastname: item.lastname || undefined,
      image: item.image || undefined,
      favouriteTopic: item.favouriteTopic || undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
  }
}
