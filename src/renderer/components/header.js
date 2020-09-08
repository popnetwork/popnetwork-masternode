const React = require('react')

const { dispatcher } = require('../lib/dispatcher')

class Header extends React.Component {
  render () {
    const loc = this.props.state.location
    return (
      <div
        className='header'
        onMouseMove={dispatcher('mediaMouseMoved')}
        onMouseEnter={dispatcher('mediaControlsMouseEnter')}
        onMouseLeave={dispatcher('mediaControlsMouseLeave')}
      >
        {this.getTitle()}
        <div className='nav left float-left'>
          <i
            className={'icon back ' + (loc.hasBack() ? '' : 'disabled')}
            title='Back'
            onClick={dispatcher('back')}
          >
            chevron_left
          </i>
          <i
            className={'icon forward ' + (loc.hasForward() ? '' : 'disabled')}
            title='Forward'
            onClick={dispatcher('forward')}
          >
            chevron_right
          </i>
        </div>
        <div className='nav right float-right'>
          <span className='header-info header-balance'><span>BALANCE: </span>{this.getBalance()}</span>
          <span className='header-info header-staked'><span>STAKED: </span>{this.getStakedBalance()}</span>
          {this.getAddButton()}
        </div>
      </div>
    )
  }

  getTitle () {
    if (process.platform !== 'darwin') return null
    const state = this.props.state
    return (<div className='title ellipsis'>{state.window.title}</div>)
  }

  getAddButton () {
    const state = this.props.state
    
    if (state.location.url() !== 'home') return null
    return (
      <i
        className='icon add'
        title='Add torrent'
        onClick={dispatcher('openFiles')}
      >
        add
      </i>
    )
  }

  getBalance () {
    const state = this.props.state
    let balance = "LOCKED";
    if (!!state.wallet && !!state.wallet.balance) 
      balance = state.wallet.balance.toFixed(2) + " POP";
    return (<span>{balance}</span>)
  }

  getStakedBalance () {
    const state = this.props.state
    let balance = "LOCKED";
    if (!!state.wallet && !!state.wallet.stakedBalance) 
      balance = state.wallet.stakedBalance.toFixed(2) + " POP";
    return (<span>{balance}</span>)
  }
}

module.exports = Header
