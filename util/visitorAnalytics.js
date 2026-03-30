const fsExtra = require('fs-extra');
const path = require('path');
const geoip = require('geoip-lite');
const { appendJsonLine } = require('./localStateLogger');

const LOG_FILE_NAME = 'visitor-events.jsonl';
const LOG_FILE_PATH = path.join(process.cwd(), 'storage', 'logs', LOG_FILE_NAME);

function normalizeIp(rawIp) {
    if (!rawIp) {
        return 'unknown';
    }

    let ip = String(rawIp).split(',')[0].trim();

    if (ip === '::1') {
        return '127.0.0.1';
    }

    if (ip.startsWith('::ffff:')) {
        ip = ip.slice(7);
    }

    if (ip.includes(':') && ip.includes('.')) {
        ip = ip.split(':').slice(-1)[0];
    }

    return ip;
}

function getClientIp(req) {
    return normalizeIp(
        req.headers['x-forwarded-for']
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || req.connection?.remoteAddress
    );
}

function isPrivateIp(ip) {
    if (!ip || ip === 'unknown') {
        return true;
    }

    if (ip === '127.0.0.1' || ip === '0.0.0.0') {
        return true;
    }

    if (ip.includes(':')) {
        return ip === '::1'
            || ip.startsWith('fc')
            || ip.startsWith('fd')
            || ip.startsWith('fe80')
            || ip.startsWith('::ffff:127.');
    }

    const parts = ip.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
        return true;
    }

    return parts[0] === 10
        || parts[0] === 127
        || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
        || (parts[0] === 192 && parts[1] === 168)
        || (parts[0] === 169 && parts[1] === 254);
}

function parseBrowser(userAgent = '') {
    const ua = userAgent.toLowerCase();

    if (!ua) return 'Unknown';
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
    if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
    if (ua.includes('micromessenger/')) return 'WeChat';
    return 'Other';
}

function parseOperatingSystem(userAgent = '') {
    const ua = userAgent.toLowerCase();

    if (!ua) return 'Unknown';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
    if (ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    return 'Other';
}

function parseDeviceType(userAgent = '') {
    const ua = userAgent.toLowerCase();

    if (!ua) return 'Unknown';
    if (ua.includes('ipad') || ua.includes('tablet')) return 'Tablet';
    if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
    return 'Desktop';
}

function lookupLocation(ip) {
    if (!ip || ip === 'unknown') {
        return {
            country: 'Unknown',
            region: '',
            city: '',
            ll: [],
            isPrivate: true,
            locationLabel: 'Unknown',
        };
    }

    if (isPrivateIp(ip)) {
        return {
            country: 'Private Network',
            region: '',
            city: '',
            ll: [],
            isPrivate: true,
            locationLabel: 'Private Network',
        };
    }

    const geo = geoip.lookup(ip);
    const country = geo?.country || 'Unknown';
    const region = geo?.region || '';
    const city = geo?.city || '';
    const parts = [city, region, country].filter(Boolean);

    return {
        country,
        region,
        city,
        ll: Array.isArray(geo?.ll) ? geo.ll : [],
        isPrivate: false,
        locationLabel: parts.length > 0 ? parts.join(' / ') : 'Unknown',
    };
}

async function logVisitorEvent(req, payload = {}) {
    const ip = getClientIp(req);
    const location = lookupLocation(ip);
    const userAgent = String(req.get('user-agent') || payload.userAgent || '');

    const event = {
        createdAt: new Date().toISOString(),
        route: String(payload.route || payload.path || req.originalUrl || '/'),
        title: String(payload.title || ''),
        referrer: String(payload.referrer || req.get('referer') || ''),
        language: String(payload.language || req.get('accept-language') || ''),
        timezone: String(payload.timezone || ''),
        screen: String(payload.screen || ''),
        viewport: String(payload.viewport || ''),
        ip,
        country: location.country,
        region: location.region,
        city: location.city,
        locationLabel: location.locationLabel,
        isPrivateIp: location.isPrivate,
        coordinates: location.ll,
        browser: parseBrowser(userAgent),
        os: parseOperatingSystem(userAgent),
        deviceType: parseDeviceType(userAgent),
        userAgent,
    };

    await appendJsonLine(LOG_FILE_NAME, event);
    return event;
}

async function readVisitorEvents() {
    if (!(await fsExtra.pathExists(LOG_FILE_PATH))) {
        return [];
    }

    const raw = await fsExtra.readFile(LOG_FILE_PATH, 'utf8');
    return raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            try {
                return JSON.parse(line);
            } catch (error) {
                return null;
            }
        })
        .filter(Boolean);
}

function toTopList(counterMap, limit = 10) {
    return [...counterMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));
}

function createDailyBuckets(days) {
    const buckets = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i -= 1) {
        const current = new Date(today);
        current.setDate(today.getDate() - i);
        buckets.push({
            date: current.toISOString().slice(0, 10),
            visits: 0,
            ipSet: new Set(),
        });
    }

    return buckets;
}

async function getVisitorSummary({ days = 30, recentLimit = 50 } = {}) {
    const safeDays = Math.max(1, Math.min(Number(days) || 30, 365));
    const events = await readVisitorEvents();

    const sinceDate = new Date();
    sinceDate.setHours(0, 0, 0, 0);
    sinceDate.setDate(sinceDate.getDate() - (safeDays - 1));

    const filtered = events
        .filter((event) => event.createdAt && new Date(event.createdAt) >= sinceDate)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const dailyBuckets = createDailyBuckets(safeDays);
    const dailyIndex = new Map(dailyBuckets.map((bucket) => [bucket.date, bucket]));

    const uniqueIps = new Set();
    const publicIps = new Set();
    const privateIps = new Set();
    const uniqueCountries = new Set();
    const uniqueRoutes = new Set();

    const routeCounter = new Map();
    const countryCounter = new Map();
    const regionCounter = new Map();
    const cityCounter = new Map();
    const browserCounter = new Map();
    const deviceCounter = new Map();
    const osCounter = new Map();
    const referrerCounter = new Map();
    const ipCounter = new Map();

    for (const event of filtered) {
        const dateKey = String(event.createdAt || '').slice(0, 10);
        const bucket = dailyIndex.get(dateKey);
        if (bucket) {
            bucket.visits += 1;
            bucket.ipSet.add(event.ip || 'unknown');
        }

        const ip = event.ip || 'unknown';
        const route = event.route || 'Unknown';
        const country = event.country || 'Unknown';
        const region = event.region || 'Unknown';
        const city = event.city || 'Unknown';
        const browser = event.browser || 'Unknown';
        const deviceType = event.deviceType || 'Unknown';
        const os = event.os || 'Unknown';
        const referrer = event.referrer ? event.referrer : 'Direct';

        uniqueIps.add(ip);
        uniqueRoutes.add(route);
        uniqueCountries.add(country);

        if (event.isPrivateIp) {
            privateIps.add(ip);
        } else {
            publicIps.add(ip);
        }

        routeCounter.set(route, (routeCounter.get(route) || 0) + 1);
        countryCounter.set(country, (countryCounter.get(country) || 0) + 1);
        regionCounter.set(region, (regionCounter.get(region) || 0) + 1);
        cityCounter.set(city, (cityCounter.get(city) || 0) + 1);
        browserCounter.set(browser, (browserCounter.get(browser) || 0) + 1);
        deviceCounter.set(deviceType, (deviceCounter.get(deviceType) || 0) + 1);
        osCounter.set(os, (osCounter.get(os) || 0) + 1);
        referrerCounter.set(referrer, (referrerCounter.get(referrer) || 0) + 1);

        const currentIpStats = ipCounter.get(ip) || {
            ip,
            count: 0,
            lastSeen: event.createdAt,
            locationLabel: event.locationLabel || 'Unknown',
            browser,
            os,
            deviceType,
            lastRoute: route,
        };

        currentIpStats.count += 1;
        currentIpStats.lastSeen = event.createdAt;
        currentIpStats.locationLabel = event.locationLabel || currentIpStats.locationLabel;
        currentIpStats.browser = browser || currentIpStats.browser;
        currentIpStats.os = os || currentIpStats.os;
        currentIpStats.deviceType = deviceType || currentIpStats.deviceType;
        currentIpStats.lastRoute = route || currentIpStats.lastRoute;
        ipCounter.set(ip, currentIpStats);
    }

    const dailyTrend = dailyBuckets.map((bucket) => ({
        date: bucket.date,
        visits: bucket.visits,
        uniqueIps: bucket.ipSet.size,
    }));

    const recentEvents = [...filtered]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, recentLimit)
        .map((event) => ({
            createdAt: event.createdAt,
            route: event.route || 'Unknown',
            ip: event.ip || 'unknown',
            locationLabel: event.locationLabel || 'Unknown',
            browser: event.browser || 'Unknown',
            os: event.os || 'Unknown',
            deviceType: event.deviceType || 'Unknown',
            referrer: event.referrer || 'Direct',
            language: event.language || '',
            timezone: event.timezone || '',
        }));

    const topIps = [...ipCounter.values()]
        .sort((a, b) => b.count - a.count || new Date(b.lastSeen) - new Date(a.lastSeen))
        .slice(0, 20);

    return {
        rangeDays: safeDays,
        totals: {
            visits: filtered.length,
            uniqueIps: uniqueIps.size,
            publicIps: publicIps.size,
            privateIps: privateIps.size,
            uniqueCountries: uniqueCountries.size,
            uniqueRoutes: uniqueRoutes.size,
        },
        dailyTrend,
        topCountries: toTopList(countryCounter),
        topRegions: toTopList(regionCounter),
        topCities: toTopList(cityCounter),
        topRoutes: toTopList(routeCounter),
        topBrowsers: toTopList(browserCounter),
        topDevices: toTopList(deviceCounter),
        topOperatingSystems: toTopList(osCounter),
        topReferrers: toTopList(referrerCounter),
        topIps,
        recentEvents,
    };
}

module.exports = {
    getClientIp,
    isPrivateIp,
    logVisitorEvent,
    getVisitorSummary,
};
