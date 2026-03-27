const fsExtra = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { mergeChunks } = require('./fileHelpers');
const { appendJsonLine } = require('./localStateLogger');
const { runPythonScript } = require('./pythonScriptRunner');

const calculateMD5 = (data) => crypto.createHash('md5').update(data).digest('hex');

const calculateFileMD5 = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fsExtra.createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

const safeRemove = async (targetPath) => {
    if (!targetPath) return;
    try {
        await fsExtra.remove(targetPath);
    } catch (error) {
        console.warn(`Failed to remove path: ${targetPath}`, error.message);
    }
};

const clearOldUploads = async (...targets) => {
    for (const target of targets.flat()) {
        await safeRemove(target);
    }
};

const getChunkFiles = (chunkDir, total) => (
    Array.from({ length: total }, (_, index) => path.join(chunkDir, index.toString()))
);

const areAllChunksUploaded = async (chunkDir, total) => {
    for (let i = 0; i < total; i++) {
        if (!(await fsExtra.pathExists(path.join(chunkDir, i.toString())))) {
            return false;
        }
    }
    return true;
};

const saveUploadRecord = async ({ timestamp, ip, fileName, finalOutputPath, fileSize, firstChunkMD5, type, number }) => {
    try {
        const logPath = await appendJsonLine('upload-records.jsonl', {
            timestamp,
            ip,
            filename: fileName,
            filepath: finalOutputPath,
            file_size: fileSize,
            first_chunk_md5: firstChunkMD5,
            request_type: type,
            file_count: number,
        });
        console.log(`Upload record saved locally: ${logPath}`);
        return null;
    } catch (error) {
        console.error('Failed to save local upload record:', error);
        return `Local upload log write failed: ${error.code || error.message}`;
    }
};

const checkAllFilesUploaded = (type, totalFiles, currentFileIndex) => {
    return Number(currentFileIndex) === Number(totalFiles);
};

const createStorageStructure = async (timestamp, ip, type1, type, fun) => {
    const storageDir = path.join(process.cwd(), 'storage');
    await fsExtra.ensureDir(storageDir);

    const dateDir = path.join(storageDir, timestamp);
    await fsExtra.ensureDir(dateDir);

    const finalDir = path.join(dateDir, `${ip}_${fun}_${type}`);
    await fsExtra.ensureDir(finalDir);

    const nestedDir = path.join(finalDir, `${type}`);
    await fsExtra.ensureDir(nestedDir);

    return path.relative(process.cwd(), nestedDir);
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
};

const sanitizeIP = (ip) => {
    if (!ip) return 'unknown';
    const normalized = String(ip).split(',')[0].trim();

    if (normalized.includes(':')) {
        if (normalized === '::1') return '127.0.0.1';
        if (normalized.startsWith('::ffff:')) return normalized.split(':').pop();

        try {
            const ip6To4 = require('ip6-to4');
            return ip6To4(normalized) || normalized;
        } catch (error) {
            return normalized;
        }
    }

    return normalized;
};

const sanitizeFileName = (name) => String(name || '').replace(/[^a-zA-Z0-9-_]/g, '_');

const readAndFilterConfigFile = async (storagePath) => {
    const configFilePath = path.join(storagePath, 'config.txt');
    if (!(await fsExtra.pathExists(configFilePath))) {
        return null;
    }
    const fileContent = await fsExtra.readFile(configFilePath, 'utf-8');
    return fileContent
        .split('\n')
        .filter((line) => !line.trim().startsWith('//'))
        .join('\n');
};

function extractPointSize(configText) {
    if (!configText) {
        return null;
    }
    const regex = /PointSize\s*=\s*(\d+)/i;
    const match = configText.match(regex);
    if (match && match[1]) {
        return parseFloat(match[1]);
    }
    throw new Error('PointSize was not found in config.txt');
}

function startAnalysisInBackground({ fun, type, finalFolder, storagePath, email, pointSize }) {
    const numericFun = Number(fun);
    const numericType = Number(type);

    runPythonScript(
        numericFun,
        numericType,
        finalFolder,
        storagePath,
        email,
        null,
        pointSize,
    )
        .then((generatedDirPath) => {
            console.log(`Analysis completed successfully: ${generatedDirPath}`);
        })
        .catch((error) => {
            console.error('Automatic analysis failed:', error);
        });
}

const handleFileUpload = async (req, _fileExtension) => {
    const { index, totalChunks, fileName, type, number, currentFileIndex, totalFiles, fun, email } = req.body;
    const total = Number.parseInt(totalChunks, 10);
    const indexInt = Number.parseInt(index, 10);

    if (!fileName) {
        throw new Error('fileName is required');
    }
    if (Number.isNaN(total) || total < 1) {
        throw new Error('Invalid total chunk count');
    }
    if (Number.isNaN(indexInt) || indexInt < 0 || indexInt >= total) {
        throw new Error('Invalid chunk index');
    }
    if (!req.file || !req.file.path) {
        throw new Error('Uploaded file is missing');
    }

    const timestamp = formatDate(new Date());
    const ip = sanitizeIP(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    const sanitizedFileName = sanitizeFileName(fileName);
    const uploadId = `${timestamp}_${ip}_${fun}_${type}_${sanitizedFileName}`;

    const projectDir = path.join('uploads', timestamp);
    const chunkDir = path.join(projectDir, uploadId);
    const chunkPath = path.join(chunkDir, indexInt.toString());
    const tempOutputPath = path.join(projectDir, `temp_${uploadId}`);
    const finalFolder = path.join(projectDir, `${ip}_${fun}_${type}`);
    const finalOutputPath = path.join(finalFolder, `${fileName}`);

    try {
        await fsExtra.ensureDir(projectDir);

        const chunkData = await fsExtra.readFile(req.file.path);
        const chunkMD5 = calculateMD5(chunkData);

        if (indexInt === 0) {
            console.log('First chunk MD5:', chunkMD5);
            await clearOldUploads(chunkDir, tempOutputPath);
        }

        await fsExtra.ensureDir(chunkDir);

        if (await fsExtra.pathExists(chunkPath)) {
            const existingChunkMD5 = await calculateFileMD5(chunkPath);
            if (existingChunkMD5 === chunkMD5) {
                console.log(`Chunk ${indexInt} already exists with identical content, skipping write.`);
                await safeRemove(req.file.path);
            } else {
                console.log(`Chunk ${indexInt} already exists with different content, overwriting.`);
                await fsExtra.move(req.file.path, chunkPath, { overwrite: true });
            }
        } else {
            await fsExtra.move(req.file.path, chunkPath);
        }

        console.log(`Chunk ${indexInt} moved to ${chunkPath}`);

        const allUploaded = await areAllChunksUploaded(chunkDir, total);
        if (!allUploaded) {
            return { code: 200, msg: 'Chunk uploaded successfully, waiting for the remaining chunks.', data: null };
        }

        console.log('All chunks uploaded, starting merge.');
        const files = getChunkFiles(chunkDir, total);
        console.log(`Chunk files to merge: ${files.join(', ')}`);
        console.log(`Temporary merged file path: ${tempOutputPath}`);

        await clearOldUploads(tempOutputPath);
        await mergeChunks(files, tempOutputPath);
        console.log('Chunk merge completed.');

        const firstChunkMD5 = await calculateFileMD5(files[0]);
        const finalMD5 = await calculateFileMD5(tempOutputPath);
        const mergedFileStat = await fsExtra.stat(tempOutputPath);
        const warnings = [];

        await fsExtra.ensureDir(finalFolder);
        if (await fsExtra.pathExists(finalOutputPath)) {
            console.log('Final file already exists and will be overwritten.');
        }
        await fsExtra.move(tempOutputPath, finalOutputPath, { overwrite: true });
        console.log(`Merged file moved to ${finalOutputPath}`);

        const dbWarning = await saveUploadRecord({
            timestamp,
            ip,
            fileName,
            finalOutputPath,
            fileSize: mergedFileStat.size,
            firstChunkMD5,
            type,
            number,
        });
        if (dbWarning) {
            warnings.push(dbWarning);
        }

        await clearOldUploads(chunkDir);

        if (checkAllFilesUploaded(type, totalFiles, currentFileIndex)) {
            try {
                const storagePath = await createStorageStructure(timestamp, ip, type, type, fun);
                console.log(`Created storage path: ${storagePath}`);
                const configText = await readAndFilterConfigFile(finalFolder);
                let pointSize = null;
                if (configText) {
                    pointSize = extractPointSize(configText);
                }
                if (pointSize == null) {
                    console.log('config.txt not found or PointSize missing, skipping optional post-upload PointSize parsing.');
                }

                startAnalysisInBackground({
                    fun,
                    type,
                    finalFolder,
                    storagePath,
                    email,
                    pointSize,
                });
                console.log('Analysis task started in background.');
            } catch (postProcessError) {
                console.error('Post-upload processing failed:', postProcessError);
                warnings.push(`Post-upload processing failed: ${postProcessError.message}`);
            }
        }

        return {
            code: 200,
            msg: 'File merge completed and chunk directory was removed.',
            data: {
                md5: finalMD5,
                first_chunk_md5: firstChunkMD5,
                warnings,
            },
        };
    } catch (error) {
        console.error(`File upload error: ${error.message}`, error);
        await clearOldUploads(req.file && req.file.path, tempOutputPath);
        throw new Error(`Server error: file upload failed - ${error.message}`);
    }
};

module.exports = {
    handleFileUpload,
    clearOldUploads,
};
