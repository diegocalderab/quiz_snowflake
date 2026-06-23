require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress',  require('./routes/progress'));
app.use('/api/stats',     require('./routes/stats'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
