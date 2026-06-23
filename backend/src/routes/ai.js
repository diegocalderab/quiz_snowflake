const router = require('express').Router();
const auth = require('../middleware/auth');

router.post('/explain', auth, async (req, res) => {
  const { question, options, selected } = req.body;
  if (!question || !options || !selected) return res.status(400).json({ error: 'Missing fields' });

  const prompt = `Eres experto en la certificación SnowPro Core de Snowflake. Responde en español, de forma concisa y directa (máximo 5 oraciones).

Pregunta del examen: ${question}

Opciones:
${options.map(o => `- ${o}`).join('\n')}

El estudiante seleccionó: ${selected.join(', ')}

Explica:
1. Cuál es la respuesta correcta y por qué
2. Por qué las otras opciones son incorrectas (brevemente)
3. Un tip mnemotécnico para el examen

Sin headers ni markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text;
    if (!text) return res.status(500).json({ error: 'No explanation returned' });
    res.json({ explanation: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service error' });
  }
});

module.exports = router;
