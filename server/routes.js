const express = require('express');
const router = express.Router();
const db = require('./db');

// READ - Get all expenses
router.get('/expenses', (req, res) => {
  db.query(
    'SELECT id, title, category, amount, DATE_FORMAT(date, "%Y-%m-%d") as date, description FROM expenses ORDER BY date DESC',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// READ - Get totals by category
router.get('/expenses/by-category', (req, res) => {
  db.query('SELECT category, SUM(amount) AS total FROM expenses GROUP BY category', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// READ - Get monthly trends
router.get('/expenses/by-month', (req, res) => {
  db.query(
    "SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(amount) AS total FROM expenses GROUP BY month ORDER BY month",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// CREATE - Add new expense
router.post('/expenses', (req, res) => {
  const { title, category, amount, date, description } = req.body;
  db.query(
    'INSERT INTO expenses (title, category, amount, date, description) VALUES (?, ?, ?, ?, ?)',
    [title, category, amount, date, description],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId, message: 'Expense added!' });
    }
  );
});

// UPDATE - Edit an expense
router.put('/expenses/:id', (req, res) => {
  const { title, category, amount, date, description } = req.body;
  db.query(
    'UPDATE expenses SET title=?, category=?, amount=?, date=?, description=? WHERE id=?',
    [title, category, amount, date, description, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Expense updated!' });
    }
  );
});

// DELETE - Remove an expense
router.delete('/expenses/:id', (req, res) => {
  db.query('DELETE FROM expenses WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Expense deleted!' });
  });
});

module.exports = router;
