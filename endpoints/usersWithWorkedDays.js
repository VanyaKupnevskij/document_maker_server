const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/usersWithWorkedDays', async (req, res) => {
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

module.exports = router;
