const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const resolvePythonInterpreter = require('../util/resolvePythonInterpreter');

// 设置基础路径
const BASE_DIR = '/home/ubuntu/newpyF/Beta';
// 获取Python解释器路径
const PYTHON_PATH = resolvePythonInterpreter();

router.get('/', function (req, res, next) {
    let strGene = "";
    const data = req.query.data;
    const file = req.query.file || "";
    let pathA = data;

    console.log('接收到请求参数:', { data, file });

    if (data == "umap") {
        strGene = 'LOC107863537';
    } else if (data == "xenium") {
        strGene = 'ABCG14a';
    }

    if ((data == "xenium" || data == "umap" || data == "spatial") && file) {
        const safeFile = path.basename(file);
        pathA = path.join(data, safeFile);
    }

    const gene = req.query.gene || strGene;

    // 使用绝对路径
    const scriptPath = path.join(BASE_DIR, 'py', 'util', `${data}_gene.py`);
    const dataPath = path.join(BASE_DIR, 'data', pathA, 'gene.csv');
    const basePath = path.join(BASE_DIR, 'data', data);

    console.log('执行脚本:', {
        pythonPath: PYTHON_PATH,
        scriptPath,
        dataPath,
        basePath,
        gene
    });

    // 使用环境变量中指定的Python解释器
    const pythonProcess = spawn(PYTHON_PATH, [
        scriptPath,
        dataPath,
        basePath,
        gene
    ], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`Python错误输出: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python进程退出，代码: ${code}`);
            console.error(`错误信息: ${errorString}`);
            return res.status(500).json({
                error: '服务器内部错误',
                details: errorString
            });
        }

        try {
            const data = JSON.parse(dataString);
            res.json(data);
        } catch (parseError) {
            console.error(`JSON解析错误: ${parseError.message}`);
            res.status(500).json({
                error: '数据解析错误',
                details: parseError.message
            });
        }
    });

    pythonProcess.on('error', (error) => {
        console.error(`启动Python进程错误: ${error.message}`);
        res.status(500).json({
            error: '启动Python进程失败',
            details: error.message
        });
    });
});

module.exports = router;
