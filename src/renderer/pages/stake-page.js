const React = require('react')
const PropTypes = require('prop-types')

const colors = require('material-ui/styles/colors')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')
const StaticValue = require('../components/static-value')

const { dispatch } = require('../lib/dispatcher')
const sConfig = require('../../sconfig')
const { openDialog } = require('electron-custom-dialog')
const EthProvider = require('../services/eth/eth-provider')
const { apiCreateRewardHistory } = require('../services/api')
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
      if ( !result || result <= 0) return
      const balance = ethers.utils.parseUnits(result.toString(), sConfig.POP_TOKEN_DECIMALS)
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
		try {
		  const response = await apiCreateRewardHistory(wallet.token, wallet.address, 'Stake', result)
		  wallet.rewardHistories.push(response)
		} catch(e) {
			console.log('Error Creating Stake History', e)
		}
      } else {
        remote.dialog.showErrorBox("WalletConnect", err.toString())
      }
    } else {
      openDialog('pendingDlg').then((result) => {
      })
      const [txid, err] = await EthProvider.wcTokenApprove(wallet.connector, wallet.address, sConfig.STAKING_CONTRACT_ADDRESS)
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
	const balance = ethers.utils.parseUnits(wallet.stakedBalance.toString(), sConfig.POP_TOKEN_DECIMALS)
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
	  try {
		const response = await apiCreateRewardHistory(wallet.token, wallet.address, 'Unstake', parseFloat(wallet.stakedBalance.toString()))
		wallet.rewardHistories.push(response)
	  } catch(e) {
		console.log('Error Creating Unstake History', e)
	  }
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
	  try {
		const response = await apiCreateRewardHistory(wallet.token, wallet.address, 'Claim', parseFloat(wallet.claimableRewards.toString()))
		wallet.rewardHistories.push(response)
	  } catch(e) {
		console.log('Error Creating Claim History', e)
	  }
    } else {
      remote.dialog.showErrorBox("WalletConnect", err.toString())
    }
  }
  render () {
    const {wallet, nodeChannel} = this.state
    const style = {
	  display: 'flex',
	  flexDirection: 'column',
	  height: 'calc(100% - 20px)',
      marginLeft: 20,
      marginRight: 20,
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
              style={buttonStyle} disabled={!!wallet.fetching ? true : false}
            />
            <RaisedButton
              className='control' label='Claim' onClick={()=>this.claim(wallet, nodeChannel)}
			  style={buttonStyle}
			  disabled={wallet.claimableRewards == 0 ? true : false}
            />
            <RaisedButton
              className='control' label='Unstake' onClick={this.unstake} onClick={()=>this.unstake(wallet, nodeChannel)}
			  style={buttonStyle}
			  disabled={wallet.stakedBalance == 0 ? true : false}
            />
          </div>
        </StakeSection>
		{this.renderHistory()}
      </div>
    )
  }

  renderHistory () {
	const { wallet } = this.state

	const style = {
		flex: 1,
		minHeight: 0,
		display: 'flex',
		flexDirection: 'column',
		padding: '0 20px'
	}
	let contentStyle = {
		flex: 1,
		overflowY: 'auto'
	}
	if (wallet.rewardHistories.length === 0) {
		contentStyle = {
			...contentStyle,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			border: '1px solid white'
		}
	}
	const emptyContentStyle = {
		display: 'block',
		fontSize: 18,
		textAlign: 'center'
	}

	return (
		<div style={style}>
			<h2>Reward History</h2>
			<div style={contentStyle}>
				{
					wallet.rewardHistories.map((rewardHistory, index) => {
						return (
							<HistoryCard
								key={index}
								date={getFullDateTime(rewardHistory.created_at)}
								type={rewardHistory.action_type}
								amount={rewardHistory.amount}
							>
							</HistoryCard>
						)
					})
				}
				{wallet.rewardHistories.length === 0 && <span style={emptyContentStyle}>No Data</span>}
			</div>
		</div>
	)
  }
}

function getFullDateTime(datetime) {
	if (!datetime) return '';
	const dateObj = new Date(datetime)
	const date = dateObj.getFullYear()+'-'+(dateObj.getMonth()+1)+'-'+dateObj.getDate();
	const time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
	return date+' '+time;
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

class HistoryCard extends React.Component {
	static get propTypes () {
		return {
		  date: PropTypes.string,
		  type: PropTypes.string,
		  amount: PropTypes.string
		}
	}

	render () {
	  const { date, type, amount } = this.props;
	  const cardStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 20,
		padding: '10px 15px',
		// boxShadow: '0 0 4px 3px rgba(0, 0, 0, 0.4)',
		backgroundColor: 'white',
		borderRadius: 10,
		color: 'black',
	  }
	  const paragraphStyle = { margin: 0 }
	  const typeStyle = {
		margin: '10px 0 0'
	  }

	  return (
		<div style={cardStyle}>
			<div>
				<p style={paragraphStyle}>{date}</p>
				<p style={typeStyle}>{type}</p>
			</div>
			<p style={paragraphStyle}>{amount}</p>
		</div>
	  )
	}
  }

module.exports = StakePage
