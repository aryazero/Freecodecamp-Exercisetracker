const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { randomUUID } = require("crypto");   

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const users = new Map();

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  if (!username || username.trim() === "") {
    return res.json({ error: "Username is required" });
  }
  const newUser = { _id: randomUUID(), username: username.trim(), log: [] };
  users.set(newUser._id, newUser);
  res.json({ username: newUser.username, _id: newUser._id });
});

app.get("/api/users", (req, res) => {
  const allUsers = Array.from(users.values()).map(u => ({
    _id: u._id,
    username: u.username
  }));
  res.json(allUsers);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.get(_id);
  if (!user) return res.json({ error: "User not found" });
  if (!description || !duration) {
    return res.json({ error: "Description and duration are required" });
  }
  const parsedDuration = Number(duration);
  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    return res.json({ error: "Duration must be a positive number" });
  }
  const exerciseDate = date ? new Date(date) : new Date();
  if (exerciseDate.toString() === "Invalid Date") {
    return res.json({ error: "Invalid date format" });
  }
  const exercise = {
    description,
    duration: parsedDuration,
    date: exerciseDate.toDateString()
  };
  user.log.push(exercise);
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.get(_id);
  if (!user) return res.json({ error: "User not found" });
  let logs = [...user.log];
  if (from) {
    const fromDate = new Date(from);
    if (fromDate.toString() !== "Invalid Date") {
      logs = logs.filter(e => new Date(e.date) >= fromDate);
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (toDate.toString() !== "Invalid Date") {
      logs = logs.filter(e => new Date(e.date) <= toDate);
    }
  }
  if (limit) {
    logs = logs.slice(0, Number(limit));
  }
  res.json({
    username: user.username,
    _id: user._id,
    count: logs.length,
    log: logs
  });
});
