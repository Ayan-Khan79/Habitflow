require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;


app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",                        // local dev
  "https://habitflow-ljko.onrender.com",          // backend's frontend link
  "https://habitflow-1-4x1z.onrender.com" ,       // deployed frontend
  "https://habitflow-1-challenge-branch.onrender.com" 
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// routes
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const challengeRoutes = require("./routes/challengeRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use("/api/challenges", challengeRoutes);

app.get('/', (req, res) => res.send('HabitFlow API is running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
