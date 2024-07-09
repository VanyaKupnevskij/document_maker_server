const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/users', async (req, res) => {
    const usersQuery = 'SELECT * FROM users';
    const workedQuery = 'SELECT * FROM workedCalendar';
  
    db.all(usersQuery, [], (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      db.all(workedQuery, [], (err, workedCalendar) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        const usersComplete = users.map(user => {
          return {
            ...user,
            workedCalendar: workedCalendar.filter(item => item.user_id === user.id)
          };
        });
  
        res.json(usersComplete);
      });
    });
});

module.exports = router;
