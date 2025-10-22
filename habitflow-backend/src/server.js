require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // 👈 your frontend URL
    credentials: true,               // 👈 allows cookies, tokens, etc.
  })
);

// routes
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => res.send('HabitFlow API is running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
