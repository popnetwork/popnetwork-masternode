const React = require('react')

const config = require('../../config')
const CustomButton = require('./custom-button')

const { dispatcher } = require('../lib/dispatcher')

class Header extends React.Component {
  constructor (props) {
    super(props)
    this.onAddWallet = this.onAddWallet.bind(this)
  }

  onAddWallet() {

  }
  
  render () {
    const loc = this.props.state.location
    return (
      <div className='header'> 
        <div className="home-icon">
          <img src={`${config.STATIC_PATH}/Home.png`} />
        </div>
        <div className="wallet-wrapper">
          <CustomButton
            label="Add Wallet"
            onOk={this.onAddWallet}
            img={`${config.STATIC_PATH}/Wallet.png`}
          />
          <div className="help-button">
            <img src={`${config.STATIC_PATH}/Help.png`} />
          </div>
          <div className="setting-button">
            <img src={`${config.STATIC_PATH}/Settings.png`} />
          </div>
        </div>
      </div>
    )
  }
}

module.exports = Header
