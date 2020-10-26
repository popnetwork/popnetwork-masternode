const electron = require('electron')
// const {BigNumber} = require('bignumber.js')
// const WalletConnect = require('@walletconnect/client').default;
// const QRCodeModal = require('@walletconnect/qrcode-modal');
const ActionCable = require('actioncable')
const config = require('../../config');
const remote = electron.remote
module.exports = class ActionCableController {
  constructor (state) {
    this.state = state
  }

  createConsumer() {
    let cable = ActionCable.createConsumer(config.WEBSOCKET_URL)
    this.state.cable = cable
    cable.subscriptions.create({ channel: 'NodeChannel', address: this.state.wallet.address }, {
      // normal channel code goes here...
      connected() {
        console.log('cable connected');
      }, 
      disconnected() {
        console.log('cable disconnected');
      },
      received(data) {
        console.log(data)
      },
    });
    console.log('cable', cable)
  }
}

