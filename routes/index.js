// routes/index.js

let express = require('express');
let router = express.Router();

const usersRouter = require('./users');
const uploadRouter = require('./upload');
const emailRouter = require('./email');
const jsonRouter = require('./json'); // 添加这一行
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 配置子路由
router.use('/users', usersRouter);
router.use('/upload', uploadRouter);
router.use('/email', emailRouter);
router.use('/json', jsonRouter);
module.exports = router;

