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
          {this.showWalletStatus()}
          {/* {this.getAddButton()} */}
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

  showWalletStatus () {
    const { wallet } = this.props.state
    if (!!wallet && !!wallet.connected) 
      return (
        <span className='wallet-status'>
          <i className='icon'>fiber_manual_record</i>
          <span>Wallet Connected</span>
        </span>
      )
    else
      return (
        <span className='wallet-status'>
          <i className='icon'>lock</i>
          <span>Wallet Locked</span>
        </span>
      )
  }
}

module.exports = Header
