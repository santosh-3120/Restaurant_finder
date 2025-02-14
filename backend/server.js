const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS
const connectDB = require('./config/db');
const restaurantRoutes = require('./routes/RestaurantRoutes');

dotenv.config();
connectDB();
console.log("HF_API_KEY from .env:", process.env.HF_API_KEY);
const app = express();

// Middleware to handle JSON
app.use(express.json());

// Middleware for CORS
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from your frontend origin

// Routes
app.use(restaurantRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
