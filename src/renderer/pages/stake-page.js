const React = require('react')
const PropTypes = require('prop-types')

const colors = require('material-ui/styles/colors')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')
const StaticValue = require('../components/static-value')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')
const { openDialog } = require('electron-custom-dialog')
const EthProvider = require('../services/eth/eth-provider')
const remote = require('electron').remote
class StakePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = props.state
  }

  async stake(wallet) {
    if(!!wallet.approval) {
      openDialog('stakeDlg', {question: wallet.balance.toString()}).then((result) => {
        // console.log('================', result) 
      })
    } else {
      openDialog('pendingDlg').then((result) => {
      })
      const [txid, err] = await EthProvider.wcTokenApprove(wallet.connector, wallet.address, config.STAKING_CONTRACT_ADDRESS)
      if (!!txid) {
        remote.BrowserWindow.getAllWindows()
          .filter(b => {
            console.log('b', b, b.getTitle())
            if (b.getTitle() == "PENDING") {
              b.close()
            }
          })
        const window = remote.BrowserWindow.getFocusedWindow();
        const detail = "https://etherscan.io/tx/" + txid;
        remote.dialog.showMessageBox(window, {
          type: 'info',
          buttons: ['OK'],
          title: "WalletConnect",
          message: "Transaction created successfully.",
          detail: detail
        })
      } else {
        remote.dialog.showErrorBox("WalletConnect", err)
      }
    }
  }

  async unstake(wallet) {
    let count = remote.BrowserWindow.getAllWindows()
    .filter(b => {
      console.log('b', b, b.getTitle())
      return b.isVisible()
    })
    .length
    console.log('asdfasd',count)
  }

  claim() {

  }
  render () {
    const {wallet} = this.state
    const style = {
      marginTop: 20,
      marginLeft: 20,
      marginRight: 20
      
    }
    const buttonStyle = {
      margin: 12,
      width: 100
    }
    const infoSectionStyle = {
      marginTop: 50,
      marginBottom: 50
    }
    const actionSectionStyle = {
      clear: 'both',
      maxWidth: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 70,
      textAlign: 'center'
    }
    return (
      <div style={style}>
        <StakeSection>
          <div style={infoSectionStyle}>
            <StaticValue
              staticText='BALANCE'
              value={wallet.balance.toFixed(6) + ' POP'}
              fontSize={18}
            />
            <StaticValue
              staticText='PENDING REWARDS'
              value='0.00 POP'
              fontSize={18}
            />
            <StaticValue
              staticText='STAKED'
              value='12403.12 POP'
              fontSize={18}
            />
          </div>
          <div style={actionSectionStyle}>
            <RaisedButton
              className='control' label={!!wallet.approval ? 'Stake' : 'Approve'} onClick={()=>this.stake(wallet)}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Claim' onClick={this.claim}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Unstake' onClick={this.unstake} onClick={()=>this.unstake(wallet)}
              style={buttonStyle}
            />
          </div>
        </StakeSection>
      </div>
    )
  }
}

class StakeSection extends React.Component {
  static get propTypes () {
    return {
      title: PropTypes.string
    }
  }

  render () {
    const style = {
      marginBottom: 25,
      marginTop: 25
    }
    return (
      <div style={style}>
        {this.props.children}
      </div>
    )
  }
}

class Stake extends React.Component {
  render () {
    const style = { marginBottom: 10 }
    return (<div style={style}>{this.props.children}</div>)
  }
}

module.exports = StakePage
