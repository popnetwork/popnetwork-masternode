const React = require('react')

const shell = require('../../main/shell')
const config = require('../../config')
const CustomButton = require('./custom-button')
const Popover = require('material-ui/Popover').default
const Menu = require('material-ui/Menu').default
const MenuItem = require('material-ui/MenuItem').default

const { dispatch } = require('../lib/dispatcher')

const NETWORK_DATA = [
  { value: 1, text: 'BSC' },
  { value: 2, text: 'Ethereum' },
]

class Header extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      openWallectConnect: false,
      anchorElWalletConnect: null,
      openedPopover: false,
      moreAnchorEl: null,
    }

    this.onHome = this.onHome.bind(this)
    this.onAddWallet = this.onAddWallet.bind(this)
    this.onDisconnect = this.onDisconnect.bind(this)
    this.onPopup = this.onPopup.bind(this)
    this.onStake = this.onStake.bind(this)
    this.onSetting = this.onSetting.bind(this)
    this.handleClickConnect = this.handleClickConnect.bind(this)
    this.handleCancelConnect = this.handleCancelConnect.bind(this)
  }

  onHome() {
    dispatch('home')
  }

  onAddWallet(walletNetwork) {
    dispatch('selectWalletNetwork', walletNetwork)
    dispatch('connectWalletDialog')
  }

  onStake() {
    const { wallet } = this.props.state
    const isETH = wallet.chainId === 1 || wallet.chainId === 3
    if (isETH)
      dispatch('stake')
    else
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
    dispatch('home')
  }

  onSetting() {
    dispatch('preferences')
  }

  handleClickConnect(event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      openWallectConnect: true,
      anchorElWalletConnect: event.currentTarget,
    });
  };

  handleCancelConnect(index) {
    this.setState({
      openWallectConnect: false,
      anchorElWalletConnect: null,
    });
  }
  
  render () {
    const { wallet } = this.props.state
    const isETH = wallet && (wallet.chainId === 1 || wallet.chainId === 3)

    return (
      <div className='header'> 
        <div className="home-icon" onClick={this.onHome}>
          <img src={`${config.STATIC_PATH}/Home.png`} draggable={false} />
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
                description={`${wallet.ethBalance.toFixed(6)} ${isETH ? 'ETH' : 'BNB'}`}
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
                      <img src={`${config.STATIC_PATH}/Disconnect.png`} style={{ marginRight: 12 }} draggable={false} />
                      <span>Disconnect</span>
                    </div>
                  </MenuItem>
                </Menu>
              </Popover>
            </>
            :
            <>
              <CustomButton
                className="add-wallet"
                label="Add Wallet"
                onClick={this.handleClickConnect}
                img={`${config.STATIC_PATH}/Wallet.png`}
              />
              <Popover
                open={this.state.openWallectConnect}
                anchorEl={this.state.anchorElWalletConnect}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={() => this.setState({
                  openWallectConnect: false,
                })}
                className="custom-dropdown"
              >
                <Menu>
                  {NETWORK_DATA.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => this.handleCancelConnect(index)}
                      className={`menu-item`}
                      style={{ borderRadius: 12, fontSize: 12 }}
                    >
                      <div className="menu-item-wrapper" onClick={() => this.onAddWallet(item.text)}>
                        <span>{item.text}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Menu>
              </Popover>
            </>
          }
          <div className="help-button" onClick={() => shell.openExternal(config.QUESTION_URL)}>
            <img src={`${config.STATIC_PATH}/Help.png`} draggable={false} />
          </div>
          <div className="setting-button" onClick={this.onSetting}>
            <img src={`${config.STATIC_PATH}/Settings.png`} draggable={false} />
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
        {img && <img src={img} draggable={false} className={`${hoverImg ? 'normal' : null}`} />}
        {hoverImg && <img src={hoverImg} className="hover" draggable={false} />}
        <div className="label-content">
          <span>{label}</span>
          <span style={{ fontSize: 10, color: '#7E8494' }}>{description}</span>
        </div>
      </div>
    )
  }
}

module.exports = Header
