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
const FRONT_PUBLIC_IN_BASE = path.join(BASE_DIR, 'PM-System-Beta', 'frontend', 'public');
const FRONT_PUBLIC_LOCAL = path.join(BACKEND_ROOT, 'frontend', 'public');
const PYTHON_PATH = resolvePythonInterpreter();
const LIST_GENES_SCRIPT_CANDIDATES = [
    path.join(BASE_DIR, 'py', 'util', 'list_genes.py'),
    path.join(BACKEND_ROOT, 'py', 'util', 'list_genes.py'),
];
const LIST_GENES_SCRIPT = LIST_GENES_SCRIPT_CANDIDATES.find((p) => fs.existsSync(p))
    || LIST_GENES_SCRIPT_CANDIDATES[0];

const geneCache = new Map();
const DEFAULT_EXAMPLE_GENE_LIMIT = 6;

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
        FRONT_PUBLIC_LOCAL,
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

function isTruthyFlag(value) {
    return ['1', 'true', 'yes', 'y'].includes(String(value || '').trim().toLowerCase());
}

function normalizeGeneList(genes) {
    const seen = new Set();
    const normalized = [];

    for (const gene of genes || []) {
        const name = String(gene || '').trim();
        const key = name.toLowerCase();
        if (!name || seen.has(key)) {
            continue;
        }
        seen.add(key);
        normalized.push(name);
    }

    return normalized;
}

function pickExampleGenes(genes) {
    const normalized = normalizeGeneList(genes);
    if (normalized.length <= DEFAULT_EXAMPLE_GENE_LIMIT) {
        return normalized;
    }

    const examples = [];
    const step = (normalized.length - 1) / (DEFAULT_EXAMPLE_GENE_LIMIT - 1);

    for (let i = 0; i < DEFAULT_EXAMPLE_GENE_LIMIT; i += 1) {
        const gene = normalized[Math.round(i * step)];
        if (gene && !examples.includes(gene)) {
            examples.push(gene);
        }
    }

    for (const gene of normalized) {
        if (examples.length >= DEFAULT_EXAMPLE_GENE_LIMIT) {
            break;
        }
        if (!examples.includes(gene)) {
            examples.push(gene);
        }
    }

    return examples;
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
        const wantsExamples = isTruthyFlag(req.query.example);

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

        if (wantsExamples && !search) {
            res.json({ success: true, data: pickExampleGenes(genes) });
            return;
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
