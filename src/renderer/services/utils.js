module.exports = {
    randomString,
}

function randomString (len=2) {
    return Math.random().toString(36).substring(len);
}
  