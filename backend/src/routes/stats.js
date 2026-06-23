const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [global, areas, recent] = await Promise.all([
      // Global stats
      pool.query(`
        SELECT
          COUNT(q.id) as total,
          COUNT(p.id) as attempted,
          COUNT(CASE WHEN p.last_correct = true THEN 1 END) as correct,
          COUNT(CASE WHEN p.id IS NULL OR p.next_due <= NOW() THEN 1 END) as due
        FROM questions q
        LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
      `, [req.user.id]),

      // By area
      pool.query(`
        SELECT
          q.area,
          COUNT(q.id) as total,
          COUNT(p.id) as attempted,
          COUNT(CASE WHEN p.last_correct = true THEN 1 END) as correct,
          COUNT(CASE WHEN p.id IS NULL OR p.next_due <= NOW() THEN 1 END) as due
        FROM questions q
        LEFT JOIN user_progress p ON p.question_id = q.id AND p.user_id = $1
        GROUP BY q.area
        ORDER BY q.area
      `, [req.user.id]),

      // Recent sessions (last 10)
      pool.query(`
        SELECT mode, area, total, correct, finished_at
        FROM quiz_sessions
        WHERE user_id = $1
        ORDER BY finished_at DESC
        LIMIT 10
      `, [req.user.id])
    ]);

    res.json({
      global: global.rows[0],
      areas: areas.rows,
      recent_sessions: recent.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
