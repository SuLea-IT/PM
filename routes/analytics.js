const express = require('express');
const { logVisitorEvent, getVisitorSummary } = require('../util/visitorAnalytics');

const router = express.Router();

router.post('/track', async (req, res) => {
    try {
        const event = await logVisitorEvent(req, req.body || {});
        res.status(201).json({
            success: true,
            data: {
                createdAt: event.createdAt,
                route: event.route,
                ip: event.ip,
            },
        });
    } catch (error) {
        console.error('Failed to log visitor event:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get('/summary', async (req, res) => {
    try {
        const days = Number(req.query.days || 30);
        const summary = await getVisitorSummary({ days });
        res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error('Failed to build visitor analytics summary:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
