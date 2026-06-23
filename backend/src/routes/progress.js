const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; // days

function nextDue(streak, correct) {
  if (!correct) return new Date(); // wrong: show again immediately
  const days = SRS_INTERVALS[Math.min(streak, SRS_INTERVALS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// PATCH /progress/:questionId — record answer
router.patch('/:questionId', auth, async (req, res) => {
  const { questionId } = req.params;
  const { correct } = req.body;
  if (typeof correct !== 'boolean') return res.status(400).json({ error: 'correct must be boolean' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2',
      [req.user.id, questionId]
    );

    const existing = rows[0];
    const attempts = (existing?.attempts || 0) + 1;
    const streak = correct ? (existing?.correct_streak || 0) + 1 : 0;
    const due = nextDue(streak, correct);

    await pool.query(`
      INSERT INTO user_progress (user_id, question_id, attempts, correct_streak, last_correct, last_seen, next_due)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      ON CONFLICT (user_id, question_id) DO UPDATE SET
        attempts = $3,
        correct_streak = $4,
        last_correct = $5,
        last_seen = NOW(),
        next_due = $6
    `, [req.user.id, questionId, attempts, streak, correct, due]);

    res.json({ attempts, streak, correct, next_due: due });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /progress/session — save completed quiz session
router.post('/session', auth, async (req, res) => {
  const { mode, area, total, correct } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO quiz_sessions (user_id, mode, area, total, correct, finished_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [req.user.id, mode, area || null, total, correct]
    );
    res.json({ session_id: rows[0].id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /progress — reset all progress
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM user_progress WHERE user_id = $1', [req.user.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
