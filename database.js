const sqlite3 = require('sqlite3').verbose();

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
    db.run(`CREATE TABLE IF NOT EXISTS "workedCalendar" (
        id	      INTEGER,
        user_id	  INTEGER,
        date	  TEXT NOT NULL,
        is_worked INTEGER DEFAULT 0,
        payed     INTEGER DEFAULT 0,
        PRIMARY KEY("id" AUTOINCREMENT),
        FOREIGN KEY("user_id") REFERENCES "users"("id")
    )`);
});

module.exports = db;