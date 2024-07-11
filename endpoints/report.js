const db = require('../database');
const express = require('express');
const createReport = require('../createReport');

const router = express.Router();

router.post('/create_report', async (req, res) => {
  try {
    const { millitary_unit1, millitary_unit2, name_who_report } = req.body;
    // Получаем всех пользователей
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });

    // Получаем рабочие дни для каждого пользователя
    const userReports = await Promise.all(users.map(async (user) => {
      const days = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM workedCalendar WHERE user_id = ? AND is_payed = 0 ORDER BY date ASC LIMIT 30',
          [user.id],
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            resolve(rows);
          }
        );
      });

      return {
        user,
        days
      };
    }));

    // Передаем данные в функцию формирования отчета
    createReport({ millitary_unit1, millitary_unit2, name_who_report });
    // createReport(userReports);

    // Обновляем записи о днях в базе данных
    await Promise.all(userReports.map(async ({ user, days }) => {
      const dayIds = days.map(day => day.id);
      await new Promise((resolve, reject) => {
        const placeholders = dayIds.map(() => '?').join(',');
        db.run(
          `UPDATE workedCalendar SET is_payed = 1 WHERE id IN (${placeholders})`,
          dayIds,
          (err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        );
      });
    }));

    res.send('Отчет успешно создан и данные обновлены');
  } catch (error) {
    console.error('Ошибка при создании отчета:', error);
    res.status(500).send('Ошибка при создании отчета');
  }
});

module.exports = router;
