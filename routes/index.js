// routes/index.js

const express = require('express');

const usersRouter = require('./users');
const uploadRouter = require('./upload');
const emailRouter = require('./email');
const jsonRouter = require('./json');
const dataRouter = require('./data');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.use('/users', usersRouter);
router.use('/upload', uploadRouter);
router.use('/email', emailRouter);
router.use('/json', jsonRouter);
router.use('/data', dataRouter);

module.exports = router;
