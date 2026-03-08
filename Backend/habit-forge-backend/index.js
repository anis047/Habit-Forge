// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');// Connect to MongoDB
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habitesRoute.js');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
// Middleware
app.use(cors());
app.use(express.json());
// Connect to MongoDB
connectDB();
//routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    time: new Date().toISOString(),
    status: 'running',
    dbStatus: 'checking...',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`test http://localhost:${PORT}`);
  }); 
