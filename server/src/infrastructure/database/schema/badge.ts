import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  badgeId: text('badge_id')
    .notNull()
    .references(() => badges.id),
  awardedAt: timestamp('awarded_at').notNull().defaultNow()
})
