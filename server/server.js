const Project = require('./models/Project');
const authMiddleware = require('./middleware/authMiddleware');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = 5000;

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Save a new project (protected)
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { imageData, color, selection } = req.body;

    const newProject = new Project({
      user: req.userId,
      imageData,
      color,
      selection
    });

    await newProject.save();

    res.status(201).json({ message: 'Project saved successfully', project: newProject });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all projects for the logged-in user (protected)
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});