const { dispatch } = require('../lib/dispatcher')
const electron = require('electron')
const remote = electron.remote
module.exports = class StakeController {
  constructor (state) {
    this.state = state
  }

  show () {
    const {wallet} = this.state
    if (!!wallet && !!wallet.connected) {
      this.state.location.go({
        url: 'stake', 
        setup: (cb) => {
          // this.state.window.title = 'Stake/Unstake POP'
          cb(null)
        }
      })
    } else {
      remote.dialog.showMessageBox({
        type: 'warning',
        buttons: ['OK'],
        title: "WalletConnect",
        message: "Login with WalletConnect",
        detail: "To use POPNetwork-Masternode service fully, \n login wallet with walletconnect first. \n Wallet->WalletConnect"
      })
    }
  }

  showFirst() {
    const {wallet} = this.state
    if (!!wallet && !!wallet.connected) {
      this.state.location.go({
        url: 'stake-first', 
        setup: (cb) => {
          cb(null)
        }
      })
    } else {
      remote.dialog.showMessageBox({
        type: 'warning',
        buttons: ['OK'],
        title: "WalletConnect",
        message: "Login with WalletConnect",
        detail: "To use POPNetwork-Masternode service fully, \n login wallet with walletconnect first. \n Wallet->WalletConnect"
      })
    }
  }
}
