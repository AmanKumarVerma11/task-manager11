const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Task = require('./models/Task');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:;"
  );
  next();
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to the Task Management API');
});

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide a username and password" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await User.create({ username, password });
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.use('/api/tasks', authMiddleware);


app.get('/api/tasks', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  const offset = (pageNumber - 1) * pageSize;

  try {
    const tasks = await Task.findAndCountAll({
      where: { UserId: req.user.id },
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      totalTasks: tasks.count,
      totalPages: Math.ceil(tasks.count / pageSize),
      currentPage: pageNumber,
      tasks: tasks.rows
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { title, status, priority } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Task title is required" });
  }

  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return res.status(400).json({ message: "Priority not set" });
  }

  try {
    const newTask = await Task.create({
      ...req.body,
      UserId: req.user.id
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: "Error creating task", error: error.message });
  }
});


app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { title, status, priority } = req.body;

  if (title && !title.trim()) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }

  if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return res.status(400).json({ message: "Invalid priority" });
  }

  try {
    const [updated] = await Task.update(req.body, {
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (updated) {
      const updatedTask = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(400).json({ message: "Error deleting task", error });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

module.exports = app;