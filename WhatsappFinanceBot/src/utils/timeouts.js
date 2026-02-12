const timeouts = {};

function clearTimeouts(id) {
    if (!timeouts[id]) return;
    Object.values(timeouts[id]).forEach(clearTimeout);
    delete timeouts[id];
}

module.exports = { timeouts, clearTimeouts };