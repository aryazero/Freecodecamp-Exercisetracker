const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
const { randomUUID } = require("crypto");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let users = [];

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: randomUUID(), log: [] };
  users.push(newUser);
  res.json({ username: newUser.username, _id: newUser._id });
});

app.get("/api/users", (req, res) => {
  res.json(users.map(u => ({ username: u.username, _id: u._id })));
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === req.params._id);

  if (!user) return res.json({ error: "User not found" });

  const exercise = {
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  user.log.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;
  const user = users.find(u => u._id === req.params._id);

  if (!user) return res.json({ error: "User not found" });

  let logs = [...user.log];

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(e => new Date(e.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs
  });
});


