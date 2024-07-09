const express = require('express');
const db = require('../database');

const router = express.Router();

router.delete('/workedCalendar/:id', async (req, res) => {
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

module.exports = router;
