const popnetwork = module.exports = {
    init,
    send,
    show,
    toggleDevTools,
    win: null
}

const { app, BrowserWindow } = require('electron')

const config = require('../../config')

function init() {
    const win = popnetwork.win = new BrowserWindow({
        backgroundColor: '#1E1E1E',
        center: true,
        fullscreen: false,
        fullscreenable: false,
        height: 150,
        maximizable: false,
        minimizable: false,
        resizable: false,
        show: false,
        skipTaskbar: true,
        title: 'popnetwork-hidden-window',
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableBlinkFeatures: 'AudioVideoTracks',
            enableRemoteModule: true,
            backgroundThrottling: false,
        },
        width: 150
    })

    win.loadURL(config.WINDOW_POPNETWORK)

    // Prevent killing the popnetwork process
    win.on('close', function(e) {
        if (app.isQuitting) {
            return
        }
        e.preventDefault()
        win.hide()
    })
}

function show() {
    if (!popnetwork.win) return
    popnetwork.win.show()
}

function send(...args) {
    if (!popnetwork.win) return
    popnetwork.win.send(...args)
}

function toggleDevTools() {
    if (!popnetwork.win) return
    if (popnetwork.win.webContents.isDevToolsOpened()) {
        popnetwork.win.webContents.closeDevTools()
        popnetwork.win.hide()
    } else {
        popnetwork.win.webContents.openDevTools({ mode: 'detach' })
    }
}