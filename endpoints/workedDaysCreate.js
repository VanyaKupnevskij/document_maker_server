const express = require('express');
const db = require('../database');

const router = express.Router();

router.post('/users/:userId/workedCalendar', async (req, res) => {
    const userId = req.params.userId;
    const days = req.body.days;
  
    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of days' });
    }
  
    const insertQuery = `INSERT INTO workedCalendar (user_id, date, is_worked) VALUES (?, ?, ?)`;
    const updateQuery = `UPDATE workedCalendar SET is_worked = ? WHERE user_id = ? AND date = ?`;
    const selectQuery = `SELECT id FROM workedCalendar WHERE user_id = ? AND date = ?`;
  
    db.serialize(() => {
      const errors = [];
      days.forEach(day => {
        db.get(selectQuery, [userId, day.date], (err, row) => {
          if (err) {
            errors.push(err.message);
          } else if (row) {
            // Если запись существует, обновляем значение is_worked
            db.run(updateQuery, [day.is_worked, userId, day.date], function (err) {
              if (err) {
                errors.push(err.message);
              }
            });
          } else {
            // Если запись не существует, создаем новую запись
            db.run(insertQuery, [userId, day.date, day.is_worked], function (err) {
              if (err) {
                errors.push(err.message);
              }
            });
          }
        });
      });
  
      if (errors.length > 0) {
        return res.status(500).json({ error: errors });
      }
  
      res.status(201).json({ message: 'Records added or updated successfully' });
    });
});

module.exports = router;
