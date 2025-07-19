ALTER TABLE "subscription_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subscription_history" CASCADE;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "created_by" SET DATA TYPE text;