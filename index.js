const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000', // Замените на адрес вашего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
  };
  
app.use(cors(corsOptions));

// Подключение к базе данных
let db = new sqlite3.Database('bonusDB.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bonusDB.db SQLite database.');
});

app.get('/api/users', (req, res) => {
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

app.get('/api/user_range', (req, res) => {
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

app.get('/api/usersWithWorkedDays', (req, res) => {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide start_date and end_date' });
    }

    const usersQuery = 'SELECT * FROM users';
    const calendarQuery = `SELECT * FROM workedCalendar WHERE date BETWEEN ? AND ?`;

    db.all(usersQuery, [], (err, users) => {
        if (err) {
        return res.status(500).json({ error: err.message });
        }

        db.all(calendarQuery, [startDate, endDate], (err, days) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Связывание рабочих дней с пользователями
        const usersWithDays = users.map(user => {
            return {
            ...user,
            workedCalendar: days.filter(day => day.user_id === user.id)
            };
        });

        res.json(usersWithDays);
        });
    });
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
