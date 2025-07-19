import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const multiplayerSessions = pgTable('multiplayer_sessions', {
  id: serial('id').primaryKey(),
  status: text('status').notNull().default('waiting'), // waiting, started, finished
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  currentQuestion: integer('current_question'),
  questions: jsonb('questions')
})

export const multiplayerPlayers = pgTable('multiplayer_players', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => multiplayerSessions.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  score: integer('score').default(0),
  isReady: boolean('is_ready').default(false),
  joinedAt: timestamp('joined_at').defaultNow()
})
