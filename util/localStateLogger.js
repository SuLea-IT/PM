const fsExtra = require('fs-extra');
const path = require('path');

const logDir = path.join(process.cwd(), 'storage', 'logs');

async function appendJsonLine(fileName, payload) {
    await fsExtra.ensureDir(logDir);
    const fullPath = path.join(logDir, fileName);
    const record = {
        createdAt: new Date().toISOString(),
        ...payload,
    };
    await fsExtra.appendFile(fullPath, `${JSON.stringify(record)}\n`, 'utf8');
    return fullPath;
}

module.exports = {
    appendJsonLine,
};
