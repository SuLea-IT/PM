const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const resolvePythonInterpreter = require('../util/resolvePythonInterpreter');

const router = express.Router();

const BASE_DIR = '/home/ubuntu/newpyF/Beta';
const SHARED_DATA_ROOT = process.env.SHARED_DATA_ROOT || '/home/ubuntu/newpyF/F';
const BACKEND_ROOT = path.resolve(__dirname, '..');
const DATA_ROOT = path.join(BASE_DIR, 'data');
const FRONT_PUBLIC_IN_BASE = path.join(BASE_DIR, 'PM-System-Beta-Front', 'public');
const FRONT_PUBLIC_SIBLING = path.resolve(BACKEND_ROOT, '..', 'PM-System-Beta-Front', 'public');
const PYTHON_PATH = resolvePythonInterpreter();
const LIST_GENES_SCRIPT_CANDIDATES = [
    path.join(BASE_DIR, 'py', 'util', 'list_genes.py'),
    path.join(BACKEND_ROOT, 'py', 'util', 'list_genes.py'),
];
const LIST_GENES_SCRIPT = LIST_GENES_SCRIPT_CANDIDATES.find((p) => fs.existsSync(p))
    || LIST_GENES_SCRIPT_CANDIDATES[0];

const geneCache = new Map();

function sanitizeName(value) {
    return path.basename(String(value || '')).trim();
}

function getDataRoots() {
    const envRoots = String(process.env.DATA_ROOTS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const roots = [
        ...envRoots,
        SHARED_DATA_ROOT,
        DATA_ROOT,
        path.join(BASE_DIR, 'public'),
        path.join(BACKEND_ROOT, 'public'),
        FRONT_PUBLIC_IN_BASE,
        FRONT_PUBLIC_SIBLING,
    ];
    // keep order, remove duplicates
    return [...new Set(roots)];
}

function hasGeneSource(datasetDir) {
    if (!datasetDir || !fs.existsSync(datasetDir) || !fs.statSync(datasetDir).isDirectory()) {
        return false;
    }
    if (fs.existsSync(path.join(datasetDir, 'gene.csv'))) {
        return true;
    }
    return fs.readdirSync(datasetDir).some((name) => name.toLowerCase().endsWith('.h5ad'));
}

function resolveDatasetDir(dataSource, dataType, options = {}) {
    const { requireGenes = false } = options;
    const checked = [];
    let fallbackDir = null;

    for (const root of getDataRoots()) {
        const candidate = path.join(root, dataSource, dataType);
        checked.push(candidate);
        if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
            continue;
        }
        if (!fallbackDir) {
            fallbackDir = candidate;
        }
        if (!requireGenes || hasGeneSource(candidate)) {
            return { datasetDir: candidate, checked, geneReady: hasGeneSource(candidate) };
        }
    }

    if (fallbackDir) {
        return { datasetDir: fallbackDir, checked, geneReady: hasGeneSource(fallbackDir) };
    }

    return { datasetDir: null, checked, geneReady: false };
}

function listDatasetTypes(dataSource) {
    const names = new Set();
    for (const root of getDataRoots()) {
        const sourceDir = path.join(root, dataSource);
        if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
            continue;
        }
        for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
            if (entry.isDirectory()) {
                names.add(entry.name);
            }
        }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
}

function runListGenes(datasetDir) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(
            PYTHON_PATH,
            [LIST_GENES_SCRIPT, datasetDir],
            { shell: true, stdio: ['pipe', 'pipe', 'pipe'] }
        );

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });

        pythonProcess.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr || `list_genes.py exited with code ${code}`));
                return;
            }
            try {
                const genes = JSON.parse(stdout);
                if (!Array.isArray(genes)) {
                    reject(new Error('list_genes.py did not return an array'));
                    return;
                }
                resolve(genes);
            } catch (err) {
                reject(new Error(`invalid list_genes.py output: ${err.message}`));
            }
        });
    });
}

router.get('/types', (req, res) => {
    try {
        const dataSource = sanitizeName(req.query.data || 'spatial');
        const types = listDatasetTypes(dataSource);
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: [] });
    }
});

router.get('/:dataType/genes', async (req, res) => {
    try {
        const dataSource = sanitizeName(req.query.data || 'spatial');
        const dataType = sanitizeName(req.params.dataType);
        const search = String(req.query.search || '').trim().toLowerCase();

        const { datasetDir, checked, geneReady } = resolveDatasetDir(dataSource, dataType, { requireGenes: true });
        if (!datasetDir) {
            res.status(404).json({
                success: false,
                message: 'dataset not found',
                data: [],
                checked,
            });
            return;
        }

        if (!geneReady) {
            res.json({
                success: true,
                message: `No gene.csv or h5ad was found for ${dataSource}/${dataType}`,
                data: [],
                checked,
            });
            return;
        }

        const cacheKey = `${dataSource}/${dataType}`;
        let genes = geneCache.get(cacheKey);
        if (!genes) {
            genes = await runListGenes(datasetDir);
            geneCache.set(cacheKey, genes);
        }

        const filtered = search
            ? genes.filter((gene) => String(gene).toLowerCase().includes(search))
            : genes;

        res.json({ success: true, data: filtered.slice(0, 200) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: [] });
    }
});

module.exports = router;
