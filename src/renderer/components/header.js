const React = require('react')

const config = require('../../config')
const CustomButton = require('./custom-button')
const Popover = require('material-ui/Popover').default
const Menu = require('material-ui/Menu').default
const MenuItem = require('material-ui/MenuItem').default

const { dispatch } = require('../lib/dispatcher')

class Header extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      openedPopover: false,
      moreAnchorEl: null,
    }

    this.onHome = this.onHome.bind(this)
    this.onAddWallet = this.onAddWallet.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)
    this.onPopup = this.onPopup.bind(this)
    this.onStake = this.onStake.bind(this)
    this.onSetting = this.onSetting.bind(this)
  }

  onHome() {
    dispatch('home')
  }

  onAddWallet() {
    dispatch('connectWalletDialog')
  }

  onStake() {
    dispatch('stakeFirst')
  }

  onPopup(event) {
    this.setState({
      openedPopover: true,
      moreAnchorEl: event.currentTarget,
    });
  }

  onDisconnect() {
    dispatch('walletDisconnect');
    this.setState({
      openedPopover: false,
      moreAnchorEl: null,
    });
  }

  onSetting() {
    dispatch('preferences')
  }
  
  render () {
    const { wallet } = this.props.state

    return (
      <div className='header'> 
        <div className="home-icon" onClick={this.onHome}>
          <img src={`${config.STATIC_PATH}/Home.png`} />
        </div>
        <div className="wallet-wrapper">
          {(!!wallet && !!wallet.connected)
            ?
            <>
              <CustomButton
                label="Staking POP"
                onClick={this.onStake}
                img={`${config.STATIC_PATH}/Stake.png`}
                style={{ marginRight: 16 }}
              />
              <StakeButton
                label={`${wallet.balance.toFixed(6)} POP`}
                description={`${wallet.ethBalance.toFixed(6)} ETH`}
                onClick={(event) => this.onPopup(event)}
                img={`${config.STATIC_PATH}/Wallet.png`}
                style={{ width: 188 }}
              />
              <Popover
                open={this.state.openedPopover}
                anchorEl={this.state.moreAnchorEl}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                onRequestClose={() => this.setState({
                  openedPopover: null,
                })}
                className="custom-dropdown"
              >
                <Menu>
                  <MenuItem
                    onClick={this.onDisconnect}
                    className={`menu-item`}
                    style={{ borderRadius: 12, fontSize: 12 }}
                  >
                    <div className="img-content">
                      <img src={`${config.STATIC_PATH}/Disconnect.png`} style={{ marginRight: 12 }} />
                      <span>Disconnect</span>
                    </div>
                  </MenuItem>
                </Menu>
              </Popover>
            </>
            :
            <CustomButton
              label="Add Wallet"
              onClick={this.onAddWallet}
              img={`${config.STATIC_PATH}/Wallet.png`}
            />
          }
          <div className="help-button">
            <img src={`${config.STATIC_PATH}/Help.png`} />
          </div>
          <div className="setting-button" onClick={this.onSetting}>
            <img src={`${config.STATIC_PATH}/Settings.png`} />
          </div>
        </div>
      </div>
    )
  }
}

class StakeButton extends React.Component {
  render () {
    const { label, description, onClick, style, className, img, hoverImg, disabled = false } = this.props
    return (
      <div className={`custom-button ${className}`} onClick={!disabled && onClick} style={style}>
        {img && <img src={img} draggable="false" className={`${hoverImg ? 'normal' : null}`} />}
        {hoverImg && <img src={hoverImg} className="hover" />}
        <div className="label-content">
          <span>{label}</span>
          <span style={{ fontSize: 10, color: '#7E8494' }}>{description}</span>
        </div>
      </div>
    )
  }
}

module.exports = Header
