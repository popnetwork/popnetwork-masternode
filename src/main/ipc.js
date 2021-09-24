module.exports = {
    init,
    setModule
}

const { app, ipcMain } = require('electron')

const log = require('./log')
const menu = require('./menu')
const windows = require('./windows')

// Messages from the main process, to be sent once the popnetwork process starts
const messageQueueMainToPopNetwork = []

// Will hold modules injected from the app that will be used on fired
// IPC events.
const modules = {}

function setModule(name, module) {
    modules[name] = module
}

function init() {
    ipcMain.once('ipcReady', function(e) {
        app.ipcReady = true
        app.emit('ipcReady')
    })

    ipcMain.once('ipcReadyPopNetwork', function(e) {
        app.ipcReadyPopNetwork = true
        log('sending %d queued messages from the main win to the popnetwork window',
            messageQueueMainToPopNetwork.length)
        messageQueueMainToPopNetwork.forEach(function(message) {
            windows.popnetwork.send(message.name, ...message.args)
            log('popnetwork: sent queued %s', message.name)
        })
    })

    /**
     * Dialog
     */

    ipcMain.on('openTorrentFile', () => {
        const dialog = require('./dialog')
        dialog.openTorrentFile()
    })
    ipcMain.on('openFiles', () => {
        const dialog = require('./dialog')
        dialog.openFiles()
    })

    /**
     * Dock
     */

    ipcMain.on('setBadge', (e, ...args) => {
        const dock = require('./dock')
        dock.setBadge(...args)
    })
    ipcMain.on('downloadFinished', (e, ...args) => {
        const dock = require('./dock')
        dock.downloadFinished(...args)
    })

    /**
     * Player Events
     */

    ipcMain.on('onPlayerOpen', function() {
        const powerSaveBlocker = require('./power-save-blocker')
        const shortcuts = require('./shortcuts')
        const thumbar = require('./thumbar')

        menu.togglePlaybackControls(true)
        powerSaveBlocker.enable()
        shortcuts.enable()
        thumbar.enable()
    })

    ipcMain.on('onPlayerUpdate', function(e, ...args) {
        const thumbar = require('./thumbar')

        menu.onPlayerUpdate(...args)
        thumbar.onPlayerUpdate(...args)
    })

    ipcMain.on('onPlayerClose', function() {
        const powerSaveBlocker = require('./power-save-blocker')
        const shortcuts = require('./shortcuts')
        const thumbar = require('./thumbar')

        menu.togglePlaybackControls(false)
        powerSaveBlocker.disable()
        shortcuts.disable()
        thumbar.disable()
    })

    ipcMain.on('onPlayerPlay', function() {
        const powerSaveBlocker = require('./power-save-blocker')
        const thumbar = require('./thumbar')

        powerSaveBlocker.enable()
        thumbar.onPlayerPlay()
    })

    ipcMain.on('onPlayerPause', function() {
        const powerSaveBlocker = require('./power-save-blocker')
        const thumbar = require('./thumbar')

        powerSaveBlocker.disable()
        thumbar.onPlayerPause()
    })

    /**
     * Folder Watcher Events
     */

    ipcMain.on('startFolderWatcher', function() {
        if (!modules.folderWatcher) {
            log('IPC ERR: folderWatcher module is not defined.')
            return
        }

        modules.folderWatcher.start()
    })

    ipcMain.on('stopFolderWatcher', function() {
        if (!modules.folderWatcher) {
            log('IPC ERR: folderWatcher module is not defined.')
            return
        }

        modules.folderWatcher.stop()
    })

    /**
     * Shell
     */

    ipcMain.on('openItem', (e, ...args) => {
        const shell = require('./shell')
        shell.openItem(...args)
    })
    ipcMain.on('showItemInFolder', (e, ...args) => {
        const shell = require('./shell')
        shell.showItemInFolder(...args)
    })
    ipcMain.on('moveItemToTrash', (e, ...args) => {
        const shell = require('./shell')
        shell.moveItemToTrash(...args)
    })

    /**
     * File handlers
     */

    ipcMain.on('setDefaultFileHandler', (e, flag) => {
        const handlers = require('./handlers')

        if (flag) handlers.install()
        else handlers.uninstall()
    })

    /**
     * Auto start on login
     */

    ipcMain.on('setStartup', (e, flag) => {
        const startup = require('./startup')

        if (flag) startup.install()
        else startup.uninstall()
    })

    /**
     * Windows: Main
     */

    const main = windows.main

    ipcMain.on('setAspectRatio', (e, ...args) => main.setAspectRatio(...args))
    ipcMain.on('setBounds', (e, ...args) => main.setBounds(...args))
    ipcMain.on('setProgress', (e, ...args) => main.setProgress(...args))
    ipcMain.on('setTitle', (e, ...args) => main.setTitle(...args))
    ipcMain.on('show', () => main.show())
    ipcMain.on('toggleFullScreen', (e, ...args) => main.toggleFullScreen(...args))
    ipcMain.on('setAllowNav', (e, ...args) => menu.setAllowNav(...args))

    /**
     * External Media Player
     */

    ipcMain.on('checkForExternalPlayer', function(e, path) {
        const externalPlayer = require('./external-player')

        externalPlayer.checkInstall(path, function(err) {
            windows.main.send('checkForExternalPlayer', !err)
        })
    })

    ipcMain.on('openExternalPlayer', (e, ...args) => {
        const externalPlayer = require('./external-player')
        const thumbar = require('./thumbar')

        menu.togglePlaybackControls(false)
        thumbar.disable()
        externalPlayer.spawn(...args)
    })

    ipcMain.on('quitExternalPlayer', () => {
        const externalPlayer = require('./external-player')
        externalPlayer.kill()
    })

    /**
     * Message passing
     */

    const oldEmit = ipcMain.emit
    ipcMain.emit = function(name, e, ...args) {
        // Relay messages between the main window and the popnetwork hidden window
        if (name.startsWith('pn-') && !app.isQuitting) {
            if (e.sender.browserWindowOptions.title === 'popnetwork-hidden-window') {
                // Send message to main window
                windows.main.send(name, ...args)
                log('popnetwork: got %s', name)
            } else if (app.ipcReadyPopNetwork) {
                // Send message to popnetwork window
                windows.popnetwork.send(name, ...args)
                log('popnetwork: sent %s', name)
            } else {
                // Queue message for popnetwork window, it hasn't finished loading yet
                messageQueueMainToPopNetwork.push({
                    name: name,
                    args: args
                })
                log('popnetwork: queueing %s', name)
            }
            return
        }

        // Emit all other events normally
        oldEmit.call(ipcMain, name, e, ...args)
    }
}