const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const sendEmail = require('./emailSender');
const { appendJsonLine } = require('./localStateLogger');

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

function resolveScriptPath(fun, type) {
    const fileMap = {
        1: 'singleCell.py',
        2: 'singleCellSpatial.py',
        3: 'BTSpatial.py',
        4: 'Xenium.py',
        5: 'h5ad.py',
    };

    const scriptFile = fileMap[Number(type)];
    if (!scriptFile) {
        return null;
    }

    return path.join(__dirname, '..', 'py', String(fun), scriptFile);
}

function getGeneratedDirPath(stdout, fallbackPath) {
    const lines = String(stdout || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        return fallbackPath;
    }

    return lines[lines.length - 1];
}

async function updateScriptRunStatus(id, status, extra = {}) {
    try {
        const logPath = await appendJsonLine('script-runs.jsonl', {
            scriptRunId: id ?? null,
            status,
            ...extra,
        });
        console.log(`Script status saved locally: ${logPath}`);
    } catch (error) {
        console.error('Failed to save local script status:', error);
    }
}

async function runPythonScript(fun, type, folderPath, storagePath, email, scriptRunId, pointSize) {
    const scriptPath = resolveScriptPath(fun, type);
    if (!scriptPath) {
        throw new Error(`未知的 type: ${type}，无法找到对应的 Python 脚本`);
    }

    if (!(await fs.pathExists(scriptPath))) {
        throw new Error(`Python 脚本不存在: ${scriptPath}`);
    }

    const pythonInterpreter = resolvePythonInterpreter();
    const normalizedFolderPath = path.resolve(folderPath);
    const normalizedStoragePath = path.resolve(storagePath);
    const args = [scriptPath, normalizedFolderPath, normalizedStoragePath];

    if (pointSize !== undefined && pointSize !== null && pointSize !== '') {
        args.push(String(pointSize));
    }

    console.log('正在执行 Python 脚本，请等待');
    console.log(`Python interpreter: ${pythonInterpreter}`);
    console.log(`Script path: ${scriptPath}`);
    console.log(`Input folder: ${normalizedFolderPath}`);
    console.log(`Output folder: ${normalizedStoragePath}`);

    await updateScriptRunStatus(scriptRunId, 'started', {
        fun,
        type,
        folderPath: normalizedFolderPath,
        storagePath: normalizedStoragePath,
        email,
        pointSize: pointSize ?? null,
    });

    const executionResult = await new Promise((resolve, reject) => {
        const child = spawn(pythonInterpreter, args, {
            cwd: path.join(__dirname, '..'),
            shell: false,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('error', (error) => {
            reject(error);
        });

        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });
    });

    const { code, stdout, stderr } = executionResult;
    const ignorableWarning =
        stderr.includes('UserWarning: No data for colormapping provided') ||
        stderr.includes('TypeError: close() argument must be a Figure');

    if (code !== 0 && !ignorableWarning) {
        const errorMessage = stderr || `Python 脚本退出码异常: ${code}`;
        console.error(`执行 Python 脚本出错: ${errorMessage}`);
        await updateScriptRunStatus(scriptRunId, 'failed', {
            error: errorMessage,
            folderPath: normalizedFolderPath,
            storagePath: normalizedStoragePath,
            email,
        });
        throw new Error(`执行 Python 脚本出错: ${errorMessage}`);
    }

    console.log('Python 脚本执行完成');
    if (stderr && !ignorableWarning) {
        console.warn(stderr);
    }

    const generatedDirPath = getGeneratedDirPath(stdout, normalizedStoragePath);
    console.log(`生成的目录路径: ${generatedDirPath}`);

    try {
        if (email) {
            console.log('开始发送邮件...');
            await sendEmail(email, generatedDirPath, {
                fun,
                type,
            });
            console.log('邮件发送成功');
        } else {
            console.warn('未提供邮箱，跳过发送邮件。');
        }

        await updateScriptRunStatus(scriptRunId, 'completed', {
            generatedDirPath,
            folderPath: normalizedFolderPath,
            storagePath: normalizedStoragePath,
            email,
        });

        const storageRootToDelete = path.dirname(normalizedStoragePath);
        const uploadsRootToDelete = storageRootToDelete.replace(`${path.sep}storage${path.sep}`, `${path.sep}uploads${path.sep}`);

        await fs.rm(storageRootToDelete, { recursive: true, force: true });
        await fs.rm(uploadsRootToDelete, { recursive: true, force: true });

        return generatedDirPath;
    } catch (emailError) {
        console.error('发送邮件时出错:', emailError);
        await updateScriptRunStatus(scriptRunId, 'failed', {
            error: emailError.message,
            generatedDirPath,
            folderPath: normalizedFolderPath,
            storagePath: normalizedStoragePath,
            email,
        });
        throw new Error(`发送邮件失败: ${emailError.message}`);
    }
}

module.exports = { runPythonScript };
