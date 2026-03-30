// routes/index.js

const express = require('express');

const uploadRouter = require('./upload');
const jsonRouter = require('./json');
const dataRouter = require('./data');

const router = express.Router();

router.get('/', function (req, res) {
  res.json({
    success: true,
    message: 'PM-System-Beta API',
  });
});

router.use('/upload', uploadRouter);
router.use('/json', jsonRouter);
router.use('/data', dataRouter);

module.exports = router;
