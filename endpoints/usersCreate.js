const express = require('express');
const db = require('../database');

const router = express.Router();

router.post('/users', async (req, res) => {
    const { lastName, firstName, secondName, unit, militaryRank } = req.body;
  
    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'Please provide lastName and firstName' });
    }
  
    const selectQuery = `SELECT id FROM users WHERE lastName = ? AND firstName = ? AND secondName = ?`;
    const insertQuery = `INSERT INTO users (lastName, firstName, secondName, unit, militaryRank) VALUES (?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE users SET unit = ?, militaryRank = ? WHERE id = ?`;
  
    db.get(selectQuery, [lastName, firstName, secondName], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (row) {
        // Если пользователь существует, обновляем его данные
        db.run(updateQuery, [unit, militaryRank, row.id], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'User updated successfully', id: row.id });
        });
      } else {
        // Если пользователь не существует, создаем нового пользователя
        db.run(insertQuery, [lastName, firstName, secondName, unit, militaryRank], function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ message: 'User created successfully', id: this.lastID });
        });
      }
    });
});

module.exports = router;
