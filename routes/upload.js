const express = require('express');
const multer = require('multer');
const { handleFileUpload, clearOldUploads } = require('../util/fileUploadHandler');

const router = express.Router();
const multerUpload = multer({ dest: 'uploads/' });

const uploadGene = {
    1: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*', '*'], uploadFileCount: 5 },
    2: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text', '.npy'], requiredFileNames: ['barcodes', 'features', 'matrix', 'barcodes_pos', '*', '*'], uploadFileCount: 7 },
    3: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*'], uploadFileCount: 6 },
    4: { allowedExtensions: ['.csv.gz', '.h5', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 4 },
    5: { allowedExtensions: ['.h5ad', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 3 },
};

const uploadGenes = {
    1: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*'], uploadFileCount: 5 },
    2: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text', '.npy'], requiredFileNames: ['barcodes', 'features', 'matrix', 'barcodes_pos', '*', '*'], uploadFileCount: 7 },
    3: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*'], uploadFileCount: 6 },
    4: { allowedExtensions: ['.csv.gz', '.h5', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 4 },
    5: { allowedExtensions: ['.h5ad', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 3 },
};

const uploadCluster = {
    1: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*'], uploadFileCount: 4 },
    2: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.npy', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', 'barcodes_pos', '*'], uploadFileCount: 6 },
    3: { allowedExtensions: ['.tsv.gz', '.mtx.gz', '.txt', '.text'], requiredFileNames: ['barcodes', 'features', 'matrix', '*'], uploadFileCount: 5 },
    4: { allowedExtensions: ['.csv.gz', '.h5', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 3 },
    5: { allowedExtensions: ['.h5ad', '.txt', '.text'], requiredFileNames: ['*', '*'], uploadFileCount: 2 },
};

async function cleanupTempFiles(files) {
    if (!Array.isArray(files) || files.length === 0) return;
    await clearOldUploads(files.map((file) => file && file.path).filter(Boolean));
}

function getRestrictions(fun, type) {
    if (fun == 1) return uploadCluster[type];
    if (fun == 2) return uploadGene[type];
    if (fun == 3) return uploadGenes[type];
    return null;
}

function validateFileTypeAndName(fun, fileName, type) {
    const restrictions = getRestrictions(fun, type);
    if (!restrictions) {
        throw new Error('Invalid upload type or function type.');
    }
    if (!fileName || !fileName.includes('.')) {
        throw new Error('Invalid file name.');
    }

    const fileExtension = fileName.slice(fileName.indexOf('.'));
    const fileNameWithoutExtension = fileName.slice(0, fileName.indexOf('.')).toLowerCase();

    if (!restrictions.allowedExtensions.includes(fileExtension)) {
        throw new Error(`Unsupported file type. Allowed types: ${restrictions.allowedExtensions.join(', ')}`);
    }

    const matchFound = restrictions.requiredFileNames.some((required) => (
        required === '*' || fileNameWithoutExtension.includes(required.toLowerCase())
    ));

    if (!matchFound) {
        throw new Error(`File name must contain one of: ${restrictions.requiredFileNames.join(', ')}`);
    }
}

router.post('/upload', multerUpload.array('file', 10), async (req, res) => {
    try {
        const { type, fileName, fun } = req.body;
        validateFileTypeAndName(fun, fileName, type);

        const uploadResults = [];
        let msg = 'Uploading';
        let code = 200;
        const fileExtension = fileName.slice(fileName.indexOf('.'));

        for (const file of req.files || []) {
            req.file = file;
            const result = await handleFileUpload(req, fileExtension);

            if (result.code >= 400) {
                code = result.code;
                msg = result.msg || 'Upload failed';
                break;
            }

            if (result.data) {
                msg = 'All files uploaded successfully';
                uploadResults.push(result.data);
            }
        }

        res.status(code).json({ code, msg, data: uploadResults });
    } catch (error) {
        console.error('File upload error:', error);
        await cleanupTempFiles(req.files);
        res.status(400).json({
            code: 400,
            msg: error.message,
            data: null,
        });
    }
});

module.exports = router;
