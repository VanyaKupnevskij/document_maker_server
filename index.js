const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000', // Замените на адрес вашего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
  };
  
app.use(cors(corsOptions));
app.use(bodyParser.json()); 

// Подключение к базе данных
let db = new sqlite3.Database('bonusDB.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bonusDB.db SQLite database.');
});


db.serialize(() => {
    // Создание таблицы users
    db.run(`CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              lastName TEXT NOT NULL,
              firstName TEXT NOT NULL,
              secondName TEXT,
              unit TEXT,
              militaryRank TEXT
            )`);
  
    // Создание таблицы workedCalendar
    db.run(`CREATE TABLE IF NOT EXISTS workedCalendar (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              date TEXT NOT NULL,
              is_worked INTEGER NOT NULL,
              FOREIGN KEY (user_id) REFERENCES users (id)
            )`);
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

app.post('/api/users', (req, res) => {
    const { lastName, firstName, secondName, unit, militaryRank } = req.body;
  
    if (!lastName || !firstName) {
      return res.status(400).json({ error: 'Please provide lastName and firstName' });
    }
  
    const query = `INSERT INTO users (lastName, firstName, secondName, unit, militaryRank) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [lastName, firstName, secondName, unit, militaryRank], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, lastName, firstName, secondName, unit, militaryRank });
    });
});

app.post('/api/users/:userId/workedCalendar', (req, res) => {
    const userId = req.params.userId;
    const days = req.body.days;
  
    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of days' });
    }
  
    const query = `INSERT INTO workedCalendar (user_id, date, is_worked) VALUES (?, ?, ?)`;
    const statements = days.map(day => ({
      query,
      values: [userId, day.date, day.is_worked]
    }));
  
    db.serialize(() => {
      const errors = [];
      statements.forEach(({ query, values }) => {
        db.run(query, values, function (err) {
          if (err) {
            errors.push(err.message);
          }
        });
      });
  
      if (errors.length > 0) {
        return res.status(500).json({ error: errors });
      }
  
      res.status(201).json({ message: 'Records added successfully' });
    });
});

app.delete('/api/workedCalendar/:id', (req, res) => {
    const recordId = req.params.id;
  
    const query = `DELETE FROM workedCalendar WHERE id = ?`;
    db.run(query, [recordId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(402).json({ error: 'Record not found' });
      }
      res.status(200).json({ message: 'Record deleted successfully' });
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
