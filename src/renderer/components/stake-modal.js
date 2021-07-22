const React = require('react')

const config = require('../../config')

const CustomButton = require('./custom-button')
const TextField = require('material-ui/TextField').default
const { dispatch, dispatcher } = require('../lib/dispatcher')

const sConfig = require("../../sconfig");
const EthProvider = require("../services/eth/eth-provider");
const { apiCreateRewardHistory } = require("../services/api");
const remote = require("electron").remote;
const { ethers } = require("ethers");

const MIN_VALUE = 50000

module.exports = class StakeModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: MIN_VALUE
    }

    this.onStake = this.onStake.bind(this)
  }

  async onStake() {
    const { value } = this.state
    if (value < MIN_VALUE) return
    const { wallet, nodeChannel } = this.props.state
    if (!!wallet.approval) {
      const balance = ethers.utils.parseUnits(
        value.toString(),
        sConfig.POP_TOKEN_DECIMALS
      );
      dispatch('confirmDialog')
      const [txid, err] = await EthProvider.wcPopChefDeposit(
        wallet.connector,
        wallet.address,
        balance.toString()
      );
      dispatch('exitModal')
      if (!!txid) {
        nodeChannel.send({ type: "init_blocks" });
        const detail = sConfig.ETHERSCAN_URL + "/tx/" + txid;
        dispatch('createTransactionDialog', detail)
        try {
          const response = await apiCreateRewardHistory(
            wallet.token,
            wallet.address,
            "Stake",
            value,
            txid
          );
          wallet.rewardHistories.push(response);
        } catch (e) {
          console.log("Error Creating Stake History", e);
        }
      } else {
        dispatch('connectErrorDialog')
      }
    } else {
      dispatch('confirmDialog')
      const [txid, err] = await EthProvider.wcTokenApprove(
        wallet.connector,
        wallet.address,
        sConfig.STAKING_CONTRACT_ADDRESS
      );
      dispatch('exitModal')
      if (!!txid) {
        const detail = sConfig.ETHERSCAN_URL + "/tx/" + txid;
        dispatch('createTransactionDialog', detail)
      } else {
        dispatch('connectErrorDialog')
      }
    }
  }

  render () {
    const { value } = this.state

    return (
      <div className='custom-modal create-magnet-modal'>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/POP.png`} />
        </div>
        <span className='content-title'>Stake POP</span>
        <div>Pending rewards will be initialized when you will Stake at least min. </div>
        <div>{MIN_VALUE} POP</div>
        <div className="input-wrapper" style={{ marginBottom: 50 }}>
          <TextField
            value={value}
            onChange={(event, newValue) => this.setState({ value: newValue })}
            underlineShow={false}
            fullWidth
            type="number"
            floatingLabelText="Amount"
            step={MIN_VALUE}
            min={MIN_VALUE}
            floatingLabelStyle={{ padding: '0px 25px', color: '#9EA1C9'  }}
            floatingLabelFocusStyle={{ padding: '10px 25px 0' }}
            floatingLabelShrinkStyle={{ padding: '10px 25px 0' }}
            inputStyle={{ width: '440px', borderRadius: '12px', background: '#1F202A', border: '1px solid #2A2D3B', padding: '8px 20px', color: '#ffffff' }}
          />
          {value < MIN_VALUE && <div className="error-text">{`Minimum amount is ${MIN_VALUE}.`}</div>}
        </div>
        <div className="button-container">
          <CustomButton
            label="Cancel"
            onClick={dispatcher('exitModal')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52, marginRight: 25 }}
          />
          <CustomButton
            label="Ok"
            onClick={this.onStake}
            style={{ background: '#B169F6', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
