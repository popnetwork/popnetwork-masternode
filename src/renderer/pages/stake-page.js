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
const { ethers } = require('ethers')
class StakePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = props.state
  }
  
  async stake(wallet, nodeChannel) {
    if(!!wallet.approval) {
      const result = await openDialog('stakeDlg', {balance: wallet.balance})
      if ( result <= 0) return
      const balance = ethers.utils.parseUnits(result.toString(), remote.process.env.POP_TOKEN_DECIMALS)
      openDialog('pendingDlg').then((result) => {
      })
      const [txid, err] = await EthProvider.wcPopChefDeposit(wallet.connector, wallet.address, balance.toString())
      remote.BrowserWindow.getAllWindows()
        .filter(b => {
          if (b.getTitle() == "PENDING") {
            b.close()
          }
        })
      if (!!txid) {
        nodeChannel.send({type: "init_blocks"});
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
        remote.dialog.showErrorBox("WalletConnect", err.toString())
      }
    } else {
      openDialog('pendingDlg').then((result) => {
      })
      const [txid, err] = await EthProvider.wcTokenApprove(wallet.connector, wallet.address, remote.process.env.STAKING_CONTRACT_ADDRESS)
      remote.BrowserWindow.getAllWindows()
      .filter(b => {
        if (b.getTitle() == "PENDING") {
          b.close()
        }
      })
      if (!!txid) {
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
        remote.dialog.showErrorBox("WalletConnect", err.toString())
      }
    }
  }

  async unstake(wallet, nodeChannel) {
    const balance = ethers.utils.parseUnits(wallet.stakedBalance.toString(), remote.process.env.POP_TOKEN_DECIMALS)
    openDialog('pendingDlg').then((result) => {
    })
    const [txid, err] = await EthProvider.wcPopChefWithdraw(wallet.connector, wallet.address, balance.toString())
    remote.BrowserWindow.getAllWindows()
      .filter(b => {
        if (b.getTitle() == "PENDING") {
          b.close()
        }
      })
    if (!!txid) {
      nodeChannel.send({type: "init_blocks"});
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
      remote.dialog.showErrorBox("WalletConnect", err.toString())
    }
  }

  async claim(wallet, nodeChannel) {
    openDialog('pendingDlg').then((result) => {
    })
    const [txid, err] = await EthProvider.wcPopChefDeposit(wallet.connector, wallet.address, 0)
    remote.BrowserWindow.getAllWindows()
        .filter(b => {
          if (b.getTitle() == "PENDING") {
            b.close()
          }
        })
    if (!!txid) {
      nodeChannel.send({type: "init_blocks"});
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
      remote.dialog.showErrorBox("WalletConnect", err.toString())
    }
  }
  render () {
    const {wallet, nodeChannel} = this.state
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
    const warningSectionStyle = {
      textAlign: 'center',
      color:'yellow'
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
              staticText='STAKED'
              value={wallet.stakedBalance.toFixed(6) + ' POP'}
              fontSize={18}
            />
            <StaticValue
              staticText='PENDING'
              value={wallet.pendingRewards.toFixed(6) + ' POP'}
              fontSize={18}
            />
            <StaticValue
              staticText='CLAIMABLE'
              value={wallet.claimableRewards.toFixed(6) + ' POP'}
              fontSize={18}
            />
          </div>
          <div style={warningSectionStyle}>
            <span>WARNING:</span><br/>
            <span>Pending rewards will be initialized when you <br/>STAKE/CLAIM/UNSTAKE POP.</span>
          </div>
          <div style={actionSectionStyle}>
            <RaisedButton
              className='control' label={!!wallet.approval ? 'Stake' : 'Approve'} onClick={()=>this.stake(wallet, nodeChannel)}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Claim' onClick={()=>this.claim(wallet, nodeChannel)}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Unstake' onClick={this.unstake} onClick={()=>this.unstake(wallet, nodeChannel)}
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
