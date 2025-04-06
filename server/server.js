const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
require('dotenv').config();
const authRoutes = require("./controllers/authController");


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/fields', require('./routes/field'));
// app.use('/api/users', require('./routes/user'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
