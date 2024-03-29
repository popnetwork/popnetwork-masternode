// const WalletConnect = require('@walletconnect/client').default;
// const QRCodeModal = require('@walletconnect/qrcode-modal');
const ActionCable = require('actioncable')
const config = require('../../config')

module.exports = class ActionCableController {
  constructor (state) {
    this.state = state
  }

  connect() {
    if (!!this.state.wallet.address) {
      let cable = ActionCable.createConsumer(config.WEBSOCKET_URL + 
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
    this.state.nodeChannel = cable.subscriptions.create({ channel: 'NodeChannel', }, {
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
          state.wallet.pendingUpdatedTime = data.timestamp;
        } else if (data.type === "new_blocks") {
          if (data.timestamp > state.wallet.pendingUpdatedTime) {
            state.wallet.pendingBlockCnt += data.new_block_cnt;
            state.wallet.pendingUpdatedTime = data.timestamp;
          }
        }
        state.wallet.pendingRewards = state.wallet.stakedBalance.multipliedBy(state.wallet.popPerBlock.multipliedBy(state.wallet.pendingBlockCnt))
      }
    });
  }
}

