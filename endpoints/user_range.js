const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/user_range', async (req, res) => {
    const userId = req.query.user_id;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
  
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide user_id, start_date, and end_date' });
    }
  
    const query = `SELECT * FROM workedCalendar WHERE user_id = ? AND date BETWEEN ? AND ?`;
    db.all(query, [userId, startDate, endDate], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
});

module.exports = router;
