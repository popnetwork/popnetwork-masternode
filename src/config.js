const appConfig = require('application-config')('popnetwork')
const path = require('path')
const electron = require('electron')
const arch = require('arch')

const APP_NAME = 'POPNetwork-Masternode'
const APP_TEAM = 'POPNetwork, LLC'
const APP_VERSION = require('../package.json').version

const IS_TEST = isTest()
const PORTABLE_PATH = IS_TEST ?
    path.join(process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp', 'PopNetworkTest') :
    path.join(path.dirname(process.execPath), 'Portable Settings')
const IS_PRODUCTION = isProduction()
const IS_PORTABLE = isPortable()

const UI_HEADER_HEIGHT = 38
const UI_TORRENT_HEIGHT = 100

module.exports = {
    ANNOUNCEMENT_URL: 'https://thepopnetwork.org/masternode/announcement',
    AUTO_UPDATE_URL: 'https://thepopnetwork.org/masternode/update',
    CRASH_REPORT_URL: 'https://thepopnetwork.org/masternode/crash-report',
    TELEMETRY_URL: 'https://thepopnetwork.org/masternode/telemetry',

    APP_COPYRIGHT: 'Copyright © 2014-2020 ' + APP_TEAM,
    APP_FILE_ICON: path.join(__dirname, '..', 'static', 'popnetworkfile'),
    APP_ICON: path.join(__dirname, '..', 'static', 'popnetwork'),
    APP_NAME: APP_NAME,
    APP_TEAM: APP_TEAM,
    APP_VERSION: APP_VERSION,
    APP_WINDOW_TITLE: APP_NAME,

    CONFIG_PATH: getConfigPath(),

    DEFAULT_TORRENTS: [
        // TODO we don't use static default torrents and fetch them from server now
        // {
        //     testID: 'pop',
        //     name: 'POPNetwork',
        //     posterFileName: 'popnetwork.png',
        //     torrentFileName: 'popnetwork.torrent'
        // },
        // {
        //     testID: 'psp',
        //     name: 'POPNetwork-SGBW-panel',
        //     posterFileName: 'POPNetwork-SGBW-panel.jpg',
        //     torrentFileName: 'POPNetwork-SGBW-panel.torrent'
        // },
     ],

    DELAYED_INIT: 3000 /* 3 seconds */ ,

    DEFAULT_DOWNLOAD_PATH: getDefaultDownloadPath(),

    GITHUB_URL: 'https://github.com/popnetwork/popnetwork-masternode',
    GITHUB_URL_ISSUES: 'https://github.com/popnetwork/masternode/issues',
    GITHUB_URL_RAW: 'https://raw.githubusercontent.com/popnetwork/popnetwork-masternode/master',
    GITHUB_URL_RELEASES: 'https://github.com/popnetwork/popnetwork-masternode/releases',
    QUESTION_URL: 'https://help.thepopnetwork.org/',
    API_BASE_URL: 'https://staging.popnet.work/api/v1',
    AUTHORIZATION: 'd3cff05bee47a745122a8c783e65653b',
    DEV_API_BASE_URL: 'https://dev.popnet.work/api/v1/',
    DEV_AUTHORIZATION: 'd3cff05bee47a745122a8c783e65653b',

    HOME_PAGE_URL: 'https://thepopnetwork.org',
    HOME_PAGE_SHORTENED_URL: 'https://popnet.work',
    TWITTER_PAGE_URL: 'https://twitter.com/popnetwork',

    IS_PORTABLE: IS_PORTABLE,
    IS_PRODUCTION: IS_PRODUCTION,
    IS_TEST: IS_TEST,

    OS_SYSARCH: arch() === 'x64' ? 'x64' : 'ia32',

    POSTER_PATH: path.join(getConfigPath(), 'Posters'),
    ROOT_PATH: path.join(__dirname, '..'),
    STATIC_PATH: path.join(__dirname, '..', 'static'),
    TORRENT_PATH: path.join(getConfigPath(), 'Torrents'),

    WINDOW_MAIN: 'file://' + path.join(__dirname, '..', 'static', 'main.html'),
    WINDOW_POPNETWORK: 'file://' + path.join(__dirname, '..', 'static', 'popnetwork.html'),
    
    WINDOW_INITIAL_BOUNDS: {
        width: 500,
        height: UI_HEADER_HEIGHT + (UI_TORRENT_HEIGHT * 6) // header + 6 torrents
    },
    WINDOW_MIN_HEIGHT: UI_HEADER_HEIGHT + (UI_TORRENT_HEIGHT * 8), // header + 8 torrents
    WINDOW_MIN_WIDTH: 992,

    UI_HEADER_HEIGHT: UI_HEADER_HEIGHT,
    UI_TORRENT_HEIGHT: UI_TORRENT_HEIGHT,

    MAX_STAKE_BALANCE: 2000000,
    ERROR_BALANCE: -1,

    ETHERSCAN_API_KEY: '1GZTXPFKCUIQA6QC9SYAA3GRM67EDTQ39X',
    INFURA_API_KEY: 'f62a2ab0fdc04a5fb781312062a46817',
    IS_DEV_NETWORK: false,
    WEBSOCKET_URL: 'wss://dev.popnet.work/cable' // (dev: 'wss://dev.popnet.work/cable', prod: wss://masternode.popnet.work/cable)
}

function getConfigPath() {
    if (IS_PORTABLE) {
        return PORTABLE_PATH
    } else {
        return path.dirname(appConfig.filePath)
    }
}

function getDefaultDownloadPath() {
    if (IS_PORTABLE) {
        return path.join(getConfigPath(), 'Downloads')
    } else {
        return getPath('downloads')
    }
}

function getPath(key) {
    if (!process.versions.electron) {
        // Node.js process
        return ''
    } else if (process.type === 'renderer') {
        // Electron renderer process
        return electron.remote.app.getPath(key)
    } else {
        // Electron main process
        return electron.app.getPath(key)
    }
}

function isTest() {
    return process.env.NODE_ENV === 'test'
}

function isPortable() {
    if (IS_TEST) {
        return true
    }

    if (process.platform !== 'win32' || !IS_PRODUCTION) {
        // Fast path: Non-Windows platforms should not check for path on disk
        return false
    }

    const fs = require('fs')

    try {
        // This line throws if the "Portable Settings" folder does not exist, and does
        // nothing otherwise.
        fs.accessSync(PORTABLE_PATH, fs.constants.R_OK | fs.constants.W_OK)
        return true
    } catch (err) {
        return false
    }
}

function isProduction() {
    if (!process.versions.electron) {
        // Node.js process
        return false
    }
    if (process.platform === 'darwin') {
        return !/\/Electron\.app\//.test(process.execPath)
    }
    if (process.platform === 'win32') {
        return !/\\electron\.exe$/.test(process.execPath)
    }
    if (process.platform === 'linux') {
        return !/\/electron$/.test(process.execPath)
    }
}