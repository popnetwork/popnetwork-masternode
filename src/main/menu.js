module.exports = {
    init,
    togglePlaybackControls,
    setWindowFocus,
    setAllowNav,
    onPlayerUpdate,
    onToggleAlwaysOnTop,
    onToggleFullScreen
}

const electron = require('electron')

const app = electron.app

const config = require('../config')
const windows = require('./windows')

let menu = null

function init() {
    menu = electron.Menu.buildFromTemplate(getMenuTemplate())
    electron.Menu.setApplicationMenu(menu)
}

function togglePlaybackControls(flag) {
    getMenuItem('Play/Pause').enabled = flag
    getMenuItem('Skip Next').enabled = flag
    getMenuItem('Skip Previous').enabled = flag
    getMenuItem('Increase Volume').enabled = flag
    getMenuItem('Decrease Volume').enabled = flag
    getMenuItem('Step Forward').enabled = flag
    getMenuItem('Step Backward').enabled = flag
    getMenuItem('Increase Speed').enabled = flag
    getMenuItem('Decrease Speed').enabled = flag
    getMenuItem('Add Subtitles File...').enabled = flag

    if (flag === false) {
        getMenuItem('Skip Next').enabled = false
        getMenuItem('Skip Previous').enabled = false
    }
}

function onPlayerUpdate(hasNext, hasPrevious) {
    getMenuItem('Skip Next').enabled = hasNext
    getMenuItem('Skip Previous').enabled = hasPrevious
}

function setWindowFocus(flag) {
    getMenuItem('Full Screen').enabled = flag
    getMenuItem('Float on Top').enabled = flag
}

// Disallow opening more screens on top of the current one.
function setAllowNav(flag) {
    getMenuItem('Preferences').enabled = flag
    if (process.platform === 'darwin') {
        getMenuItem('Create New Torrent...').enabled = flag
    } else {
        getMenuItem('Create New Torrent from Folder...').enabled = flag
        // TODO we don't show this menu for now
        // getMenuItem('Create New Torrent from File...').enabled = flag
    }
}

function onToggleAlwaysOnTop(flag) {
    getMenuItem('Float on Top').checked = flag
}

function onToggleFullScreen(flag) {
    getMenuItem('Full Screen').checked = flag
}

function getMenuItem(label) {
    for (let i = 0; i < menu.items.length; i++) {
        const menuItem = menu.items[i].submenu ? menu.items[i].submenu.items.find(function(item) {
            return item.label === label
        }) : { enabled: false }
        if (menuItem) return menuItem
    }

    return { enabled: false }
}

function getMenuTemplate() {
    const template = [
        {
            label: 'Home',
            click: () => windows.main.dispatch('home')
        },
        {
            label: 'Preferences',
            click: () => windows.main.dispatch('preferences'),
        },
        {
            label: 'Developer',
            submenu: [
                {
                    label: 'Developer Tools',
                    click: () => windows.main.toggleDevTools()
                },
                {
                    label: 'POP Network Process',
                    click: () => windows.popnetwork.toggleDevTools()
                },
                {
                    label: 'Contribute on GitHub',
                    click: () => {
                        const shell = require('./shell')
                        shell.openExternal(config.GITHUB_URL)
                    }
                },
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Report an Issue',
                    click: () => {
                        const shell = require('./shell')
                        shell.openExternal(config.GITHUB_URL_ISSUES)
                    }
                },
                {
                    label: 'Help center',
                    click: () => {
                        const shell = require('./shell')
                        shell.openExternal(config.TWITTER_PAGE_URL)
                    }
                }
            ]
        },
        {
            label: 'About ' + config.APP_NAME,
            click: () => {
                const dialog = require('./dialog')
                dialog.openAbout()
            }
        }
    ]

    if (process.platform === 'darwin') {
        // popnetwork menu (Mac)
        template.splice(0, 1, {
            label: 'Home',
            submenu: [
                {
                    label: 'Home',
                    click: () => windows.main.dispatch('home')
                }
            ]
        })
        template.splice(1, 1, {
            label: 'Preferences',
            submenu: [
                {
                    label: 'Preferences',
                    click: () => windows.main.dispatch('preferences'),
                }
            ]
        })
        template.splice(4, 1, {
            label: 'About ' + config.APP_NAME,
            submenu: [
                {
                    label: 'About ' + config.APP_NAME,
                    click: () => {
                        const dialog = require('./dialog')
                        dialog.openAbout()
                    }
                }
            ]
        })
    }

    // On Windows and Linux, open dialogs do not support selecting both files and
    // folders and files, so add an extra menu item so there is one for each type.
    if (process.platform === 'linux' || process.platform === 'win32') {
        // File menu (Windows, Linux)
    }
    // Add "File > Quit" menu item so Linux distros where the system tray icon is
    // missing will have a way to quit the app.
    if (process.platform === 'linux') {
        // File menu (Linux)
        // template[0].submenu.push({
        //     label: 'Quit',
        //     click: () => app.quit()
        // })
    }

    return template
}