const React = require('react')

const config = require('../../config')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class ConnectWalletModal extends React.Component {
  constructor(props) {
    super(props)

    this.handleConnectWallet = this.handleConnectWallet.bind(this)
  }

  handleConnectWallet() {
    dispatch('walletConnect')
    dispatch('exitModal')
  }

  render () {

    return (
      <div className='custom-modal connect-wallet-modal'>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/WalletPink.png`} />
        </div>
        <span className='content-title'>Connect your wallet</span>
        <div className='gray-title'>Connect with one of available wallet</div>
        <div className='gray-title'>providers or create a new wallet.</div>
        <div className="input-wrapper" onClick={this.handleConnectWallet}>
          <div className="image-wrapper">
            <img src={`${config.STATIC_PATH}/WalletConnect.png`} />
          </div>
          <div className="text-wrapper">
            <div className="text">WalletConnect</div>
            <div className="memo">Connect with Rainbow, Trust, </div>
            <div className="memo">Argent and more</div>
          </div>
        </div>
        <div className="footer-wrapper">
          <div className="foot-text">We do not own your private keys and cannot</div>
          <div className="foot-text">access your funds without your confirmation.</div>
        </div>
      </div>
    )
  }
}
