module.exports = {
    randomString,
    normalizeAddress
}

function randomString (len=2) {
    return Math.random().toString(36).substring(len);
}

function normalizeAddress (address) {
    if (!!address) {
        return String(address).toLowerCase();
    }
    return "";
}
  