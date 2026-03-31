const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://testinfast.vercel.app'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Telegram result sender
app.post('/api/submit-result', async (req, res) => {
  try {
    const { firstName, lastName, group, correctCount, wrongCount, score, percentage, passed } = req.body;

    const now = new Date();
    const submittedAt = now.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const statusEmoji = passed ? '✅ O\'tdi' : '❌ O\'tmadi';

    const message = `📘 *Frontend Final Exam Result*

👤 *Student:* ${firstName} ${lastName}
👥 *Group:* ${group}

✅ *Correct:* ${correctCount}
❌ *Wrong:* ${wrongCount}
🎯 *Score:* ${score}/100
📊 *Percentage:* ${percentage}%
📝 *Status:* ${statusEmoji}

🕒 *Submitted At:* ${submittedAt}`;

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' &&
        TELEGRAM_CHAT_ID && TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID_HERE') {
      
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      
      const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const telegramData = await telegramResponse.json();

      if (!telegramData.ok) {
        console.error('Telegram API error:', telegramData);
      } else {
        console.log('✅ Result sent to Telegram successfully');
      }
    } else {
      console.log('⚠️ Telegram credentials not configured. Skipping notification.');
    }

    res.json({ success: true, message: 'Result submitted successfully' });
  } catch (error) {
    console.error('Error sending to Telegram:', error.message);
    // Still return success - don't break exam flow
    res.json({ success: true, message: 'Result saved (Telegram notification failed)' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
