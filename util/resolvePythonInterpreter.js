const fs = require('fs');
const path = require('path');

function resolvePythonInterpreter() {
    const configured = String(process.env.PYTHON_INTERPRETER || '').trim();
    if (!configured) {
        return process.platform === 'win32' ? 'python' : 'python3';
    }

    const basename = path.basename(configured).toLowerCase();
    if (basename === 'python' || basename === 'python.exe') {
        return configured;
    }

    const candidates = process.platform === 'win32'
        ? [path.join(configured, 'python.exe'), path.join(configured, 'Scripts', 'python.exe')]
        : [path.join(configured, 'bin', 'python'), path.join(configured, 'python')];

    const matched = candidates.find((candidate) => fs.existsSync(candidate));
    return matched || configured;
}

module.exports = resolvePythonInterpreter;
