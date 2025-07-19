import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  quizzes: jsonb('quizzes').notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at')
})
