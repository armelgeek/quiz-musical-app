// Types for quiz result and related entities
import { z } from 'zod';

export const QuizResultSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  score: z.number(),
  passed: z.boolean(),
  completedAt: z.string(),
  title: z.string(),
  passingScore: z.number(),
  maxScore: z.number(),
  subject: z.string(),
  topic: z.string(),
  duration: z.string(),
  selectedAnswers: z.record(z.string(), z.string()),
  timeLeft: z.number(),
});

export type QuizResult = z.infer<typeof QuizResultSchema>;

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  passingScore: z.number(),
  maxScore: z.number(),
  xpReward: z.number(),
  subject: z.string(),
  topic: z.string(),
  duration: z.string(),
  code: z.string(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    profilePicture: z.string().optional(),
    rank: z.string().optional(),
    level: z.number().optional(),
    xp: z.number().optional(),
    favouriteTopic: z.string().optional(),
  }),
  isPublic: z.boolean(),
  questions: z.array(z.object({
    id: z.number(),
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    points: z.number().optional(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Quiz = z.infer<typeof QuizSchema>;
