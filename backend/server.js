require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const sessionRoutes = require('./routes/session');
const dashboardRoutes = require('./routes/dashboard');
const widgetRoutes = require('./routes/widget');

const app = express();
const PORT = process.env.PORT || 5000;

// Fix CORS to allow ALL origins
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization', 'x-api-key'],
  credentials: false
}));
app.options('*', cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/widget', widgetRoutes);

app.get('/health', (req, res) => {
  res.json({ status: "Guardian Auth Running" });
});

app.listen(PORT, () => {
  console.log(`Guardian Auth server running on port ${PORT}`);
});
