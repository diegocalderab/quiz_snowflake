const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/session', auth, async (req, res) => {
  const { mode, area, limit = 40 } = req.query;
  const now = new Date();
  let query, params;

  if (mode === 'due') {
    query = `
      SELECT q.id, q.area, q.question, q.options, q.choose_n, q.correct, q.explanation, q.reference,
             p.attempts, p.correct_streak, p.last_correct, p.last_seen, p.next_due
      FROM questions q
      LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      WHERE p.id IS NULL OR p.next_due <= $2
      ORDER BY RANDOM() LIMIT $3`;
    params = [req.user.id, now, parseInt(limit)];
  } else if (mode === 'weak') {
    query = `
      SELECT q.id, q.area, q.question, q.options, q.choose_n, q.correct, q.explanation, q.reference,
             p.attempts, p.correct_streak, p.last_correct, p.last_seen, p.next_due
      FROM questions q
      INNER JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      WHERE p.last_correct = false
      ORDER BY RANDOM() LIMIT $2`;
    params = [req.user.id, parseInt(limit)];
  } else if (mode === 'area' && area) {
    query = `
      SELECT q.id, q.area, q.question, q.options, q.choose_n, q.correct, q.explanation, q.reference,
             p.attempts, p.correct_streak, p.last_correct, p.last_seen, p.next_due
      FROM questions q
      LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      WHERE q.area = $2
      ORDER BY RANDOM() LIMIT $3`;
    params = [req.user.id, area, parseInt(limit)];
  } else if (mode === 'exam') {
    query = `
      SELECT q.id, q.area, q.question, q.options, q.choose_n, q.correct, q.explanation, q.reference,
             p.attempts, p.correct_streak, p.last_correct, p.last_seen, p.next_due
      FROM questions q
      LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      ORDER BY RANDOM() LIMIT 100`;
    params = [req.user.id];
  } else {
    query = `
      SELECT q.id, q.area, q.question, q.options, q.choose_n, q.correct, q.explanation, q.reference,
             p.attempts, p.correct_streak, p.last_correct, p.last_seen, p.next_due
      FROM questions q
      LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      ORDER BY RANDOM() LIMIT $2`;
    params = [req.user.id, parseInt(limit)];
  }

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/areas', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT q.area,
             COUNT(q.id) as total,
             COUNT(CASE WHEN p.last_correct = true THEN 1 END) as correct,
             COUNT(CASE WHEN p.id IS NULL OR p.next_due <= NOW() THEN 1 END) as due
      FROM questions q
      LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      GROUP BY q.area ORDER BY q.area
    `, [req.user.id]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
