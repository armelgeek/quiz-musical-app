import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  instruction: text('instruction').notNull(),
  passingScore: integer('passing_score').notNull(),
  maxScore: integer('max_score').notNull(),
  xpReward: integer('xp_reward').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  topic: varchar('topic', { length: 255 }).notNull(),
  duration: varchar('duration', { length: 50 }).notNull(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  isPublic: boolean('is_public').default(true),
  questions: jsonb('questions').notNull(), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const quizProgress = pgTable('quiz_progress', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .notNull()
    .references(() => quizzes.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  currentQuestion: integer('current_question').default(0),
  selectedAnswers: jsonb('selected_answers'), 
  timeLeft: integer('time_left'),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .notNull()
    .references(() => quizzes.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  score: integer('score').notNull(),
  passed: boolean('passed').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
  title: varchar('title', { length: 255 }).notNull(),
  passingScore: integer('passing_score').notNull(),
  code: varchar('code', { length: 255 }).notNull(),
  maxScore: integer('max_score').notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  topic: varchar('topic', { length: 255 }).notNull(),
  duration: varchar('duration', { length: 50 }).notNull(),
  selectedAnswers: jsonb('selected_answers'),
  timeLeft: integer('time_left'),
  updatedAt: timestamp('updated_at').defaultNow()
})
