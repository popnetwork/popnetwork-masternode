const electron = require('electron')
const {BigNumber} = require('bignumber.js')
// const WalletConnect = require('@walletconnect/client').default;
// const QRCodeModal = require('@walletconnect/qrcode-modal');
const ActionCable = require('actioncable')
const config = require('../../config');
const remote = electron.remote
module.exports = class ActionCableController {
  constructor (state) {
    this.state = state
  }

  connect() {
    if (!!this.state.wallet.address) {
      let cable = ActionCable.createConsumer(remote.process.env.WEBSOCKET_URL + 
        '?address=' + this.state.wallet.address +
        '&token=' + this.state.wallet.token);
      console.log('cable connect', cable)
      this.state.cable = cable
      this.subscribeNodeChannel(cable);
    }
  }

  disconnect() {
    console.log('cable disconnect', this.state.cable)
    if (!!this.state.cable) {
      this.state.cable.disconnect();
    }
  }

  subscribeNodeChannel(cable) {
    let state = this.state;
    cable.subscriptions.create({ channel: 'NodeChannel', }, {
      // normal channel code goes here...
      connected() {
        console.log('cable connected');
      }, 
      disconnected() {
        console.log('cable disconnected');
      },
      received(data) {
        if (data.type === "pending_blocks") {
          state.wallet.pendingBlockCnt = data.pending_block_cnt;
        } else if (data.type === "new_blocks") {
          state.wallet.pendingBlockCnt += data.new_block_cnt;
        }
        state.wallet.pendingRewards = state.wallet.popPerBlock.multipliedBy(state.wallet.pendingBlockCnt)
      }
    });
  }
}

