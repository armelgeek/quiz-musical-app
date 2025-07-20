import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const battleRoyaleSessions = pgTable('battle_royale_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  mode: text('mode').notNull(),
  round: integer('round').notNull(),
  players: jsonb('players').notNull(),
  quizzes: jsonb('quizzes').notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  eliminatedUserIds: jsonb('eliminated_user_ids').notNull(),
  currentQuestionIndex: integer('current_question_index').notNull(),
  winnerUserId: text('winner_user_id')
})
