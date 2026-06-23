CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  area VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  choose_n INTEGER NOT NULL DEFAULT 1,
  correct JSONB NOT NULL DEFAULT '[]',
  explanation TEXT DEFAULT '',
  reference TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  last_correct BOOLEAN,
  last_seen TIMESTAMPTZ,
  next_due TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(50) NOT NULL,
  area VARCHAR(255),
  total INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_due ON user_progress(user_id, next_due);
CREATE INDEX IF NOT EXISTS idx_questions_area ON questions(area);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions(user_id);
