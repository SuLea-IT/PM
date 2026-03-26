const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

const findUserById = (userId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]);
            }
        });
    });
};

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = {
    findUserById,
    query,
};
