-- Migration SQL pour la table quiz_results
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL,
  code TEXT NOT NULL,
  max_score INTEGER NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration TEXT NOT NULL,
  selected_answers JSONB NOT NULL,
  time_left INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at);
