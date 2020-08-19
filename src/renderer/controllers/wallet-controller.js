const path = require('path')
const ipcRenderer = require('electron').ipcRenderer

const { dispatch } = require('../lib/dispatcher')

module.exports = class WalletController {
  constructor (state) {
    this.state = state
  }

  walletConnect() {
    
  }
  
}

