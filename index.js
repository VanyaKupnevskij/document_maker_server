const express = require('express');
const cors = require('cors');
const db = require('./database');
const bodyParser = require('body-parser');

const reportRoute = require('./endpoints/report');
const usersRoute = require('./endpoints/users');
const userRangeRoute = require('./endpoints/user_range');
const usersWithWorkedDaysRoute = require('./endpoints/usersWithWorkedDays');
const usersCreateRoute = require('./endpoints/usersCreate');
const workedDaysCreateRoute = require('./endpoints/workedDaysCreate');
const dayDeleteRoute = require('./endpoints/dayDelete');

const app = express();
const port = 3001;

const corsOptions = {
    origin: 'http://localhost:3000', // Замените на адрес вашего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
  };
  
app.use(cors(corsOptions));
app.use(bodyParser.json()); 
app.use('/api', reportRoute);
app.use('/api', usersRoute);
app.use('/api', userRangeRoute);
app.use('/api', usersWithWorkedDaysRoute);
app.use('/api', usersCreateRoute);
app.use('/api', workedDaysCreateRoute);
app.use('/api', dayDeleteRoute);

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
