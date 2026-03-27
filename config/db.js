const warnedMessages = new Set();

function warnOnce(message) {
    if (warnedMessages.has(message)) return;
    warnedMessages.add(message);
    console.warn(message);
}

async function findUserById(_userId) {
    warnOnce('[db disabled] findUserById() was called, returning null.');
    return null;
}

async function query(_sql, _params) {
    warnOnce('[db disabled] query() was called, skipping database access.');
    return [];
}

module.exports = {
    findUserById,
    query,
};
