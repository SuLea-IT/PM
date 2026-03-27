let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
const indexRouter = require('./routes');

console.log('正在初始化服务器...');

let app = express();

// 设置端口
const port = process.env.PORT || 3000;

// 设置详细的 CORS 配置
const corsOptions = {
    origin: function (origin, callback) {
        console.log('收到来自以下来源的请求:', origin);
        const allowedOrigins = ['http://54.245.89.178:3001', 'http://localhost:3001'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS 错误: 不允许的来源', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// 添加预检请求处理
app.options('*', cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api', function (req, res, next) {
    console.log('收到 API 请求:', req.method, req.url);
    res.header('Access-Control-Allow-Origin', 'http://54.245.89.178:5173');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
}, indexRouter);

// 错误处理
app.use(function (err, req, res, next) {
    console.error('发生错误:', err.stack);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
});

// 启动服务器
try {
    app.listen(port, () => {
        console.log(`服务器成功启动并运行在 http://localhost:${port}`);
        console.log('CORS 配置已启用，允许的域名:', corsOptions.origin);
    });
} catch (error) {
    console.error('服务器启动失败:', error);
}

module.exports = app; 