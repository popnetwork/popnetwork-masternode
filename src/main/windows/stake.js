const stake = module.exports = {
  init,
  win: null
}

const config = require('../../config')
const electron = require('electron')

function init () {
  if (stake.win) {
    return stake.win.show()
  }

  const win = stake.win = new electron.BrowserWindow({
    backgroundColor: '#ECECEC',
    center: true,
    fullscreen: false,
    height: 170,
    icon: getIconPath(),
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    title: 'STAKE/UNSTAKE POP',
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableBlinkFeatures: 'AudioVideoTracks'
    },
    width: 300
  })

  win.loadURL(config.WINDOW_STAKE)

  // No menu on the Stake window
  win.setMenu(null)

  win.once('ready-to-show', function () {
    win.show()
  })

  win.once('closed', function () {
    about.win = null
  })
}

function getIconPath () {
  return process.platform === 'win32'
    ? config.APP_ICON + '.ico'
    : config.APP_ICON + '.png'
}
