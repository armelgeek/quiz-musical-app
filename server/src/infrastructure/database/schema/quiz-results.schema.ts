import { sql } from 'drizzle-orm'
import { boolean, integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  quizId: text('quiz_id').notNull(),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  completedAt: timestamp('completed_at')
    .notNull()
    .default(sql`now()`),
  title: text('title').notNull(),
  passingScore: integer('passing_score').notNull(),
  code: text('code').notNull(),
  maxScore: integer('max_score').notNull(),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  duration: text('duration').notNull(),
  selectedAnswers: json('selected_answers').notNull(),
  timeLeft: integer('time_left').notNull(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
})
