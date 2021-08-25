/* eslint-disable camelcase */

module.exports = {
    run
}

const fs = require('fs')
const path = require('path')
const semver = require('semver')

const config = require('../../config')

// Change `state.saved` (which will be saved back to config.json on exit) as
// needed, for example to deal with config.json format changes across versions
function run(state) {
    // Replace '{ version: 1 }' with app version (semver)
    if (!semver.valid(state.saved.version)) {
        state.saved.version = '0.0.0' // Pre-0.7.0 version, so run all migrations
    }

    const version = state.saved.version
    const saved = state.saved

    if (semver.lt(version, '1.0.0')) migrate_1_0_0(saved)

    // Config is now on the new version
    state.saved.version = config.APP_VERSION
}

function migrate_1_0_0(saved) {
    if (saved.wallet == null) {
        let wallet = {};
        wallet.address = null;
        wallet.token = null;
        saved.wallet = wallet;
    }
}