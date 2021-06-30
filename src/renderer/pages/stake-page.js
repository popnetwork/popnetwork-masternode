const React = require("react");
const PropTypes = require("prop-types");

const config = require("../../config");
const CustomButton = require("../components/custom-button");

const { dispatch } = require("../lib/dispatcher");
const sConfig = require("../../sconfig");
const { openDialog } = require("electron-custom-dialog");
const EthProvider = require("../services/eth/eth-provider");
const { apiCreateRewardHistory } = require("../services/api");
const remote = require("electron").remote;
const { ethers } = require("ethers");
class StakePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.state;
  }

  async stake(wallet, nodeChannel) {
    dispatch('stakeDialog', wallet, nodeChannel)
  }

  async unstake(wallet, nodeChannel) {
    const balance = ethers.utils.parseUnits(
      wallet.stakedBalance.toString(),
      sConfig.POP_TOKEN_DECIMALS
    );
    dispatch('confirmDialog')
    const [txid, err] = await EthProvider.wcPopChefWithdraw(
      wallet.connector,
      wallet.address,
      balance.toString()
    );
    dispatch('exitModal')
    if (!!txid) {
      nodeChannel.send({ type: "init_blocks" });
      const window = remote.BrowserWindow.getFocusedWindow();
      const detail = "https://etherscan.io/tx/" + txid;
      remote.dialog.showMessageBox(window, {
        type: "info",
        buttons: ["OK"],
        title: "WalletConnect", 
        message: "Transaction created successfully.",
        detail: detail,
      });
      try {
        const response = await apiCreateRewardHistory(
          wallet.token,
          wallet.address,
          "Unstake",
          parseFloat(wallet.stakedBalance.toString())
        );
        wallet.rewardHistories.push(response);
      } catch (e) {
        console.log("Error Creating Unstake History", e);
      }
    } else {
      dispatch('connectErrorDialog')
    }
  }

  async claim(wallet, nodeChannel) {
    dispatch('confirmDialog')
    const [txid, err] = await EthProvider.wcPopChefDeposit(
      wallet.connector,
      wallet.address,
      0
    );
    dispatch('exitModal')
    if (!!txid) {
      nodeChannel.send({ type: "init_blocks" });
      const window = remote.BrowserWindow.getFocusedWindow();
      const detail = "https://etherscan.io/tx/" + txid;
      remote.dialog.showMessageBox(window, {
        type: "info",
        buttons: ["OK"],
        title: "WalletConnect",
        message: "Transaction created successfully.",
        detail: detail,
      });
      try {
        const response = await apiCreateRewardHistory(
          wallet.token,
          wallet.address,
          "Claim",
          parseFloat(wallet.claimableRewards.toString())
        );
        wallet.rewardHistories.push(response);
      } catch (e) {
        console.log("Error Creating Claim History", e);
      }
    } else {
      dispatch('connectErrorDialog')
    }
  }
  render() {
    const { wallet, nodeChannel } = this.state;

    console.log('history', wallet.rewardHistories)
    return (
      <div className="stake-page">
        <div className="header-wrapper">
          <div className="content-title">Staking POP</div>
          <div className="button-wrapper">
            <CustomButton
              label="Unstake"
              onClick={() => this.unstake(wallet, nodeChannel)}
              disabled={wallet.stakedBalance == 0 ? true : false}
              style={{
                background: "#2A2D3B",
                width: 150,
                height: 40,
                marginRight: 16,
              }}
            />
            <CustomButton
              label={!!wallet.approval ? "Stake" : "Approve"}
              onClick={() => this.stake(wallet, nodeChannel)}
              disabled={!!wallet.fetching ? true : false}
              style={{
                background: "#2A2D3B",
                width: 150,
                height: 40,
                marginRight: 16,
              }}
            />
            <CustomButton
              label="Claim"
              onClick={() => this.claim(wallet, nodeChannel)}
              disabled={wallet.claimableRewards == 0 ? true : false}
              style={{
                background: "#B169F6",
                width: 150,
                height: 40,
              }}
            />
          </div>
        </div>
        <div className="stake-section">
          <div className="stake-item">
            <div className="title">Balance</div>
            <div className="value">{wallet.balance.toFixed(6) + " POP"}</div>
          </div>
          <div className="stake-item">
            <div className="title">Staked</div>
            <div className="value">
              {wallet.stakedBalance.toFixed(6) + " POP"}
            </div>
          </div>
          <div className="stake-item">
            <div className="title">Pending</div>
            <div className="value">
              {wallet.pendingRewards.toFixed(6) + " POP"}
            </div>
          </div>
          <div className="stake-item">
            <div className="title">POP Earned</div>
            <div className="value">
              {wallet.claimableRewards.toFixed(6) + " POP"}
            </div>
          </div>
        </div>
        <div className="horizontal-divider"></div>
        <div className="reward-container">
          <div className="icon-wrapper">
            <img src={`${config.STATIC_PATH}/TicketStar.png`} />
          </div>
          <div className="title">Reward History</div>
          {wallet.rewardHistories.map((rewardHistory, index) => (
            <div className="reward-wrapper" key={index}>
              <div className="reward-item type">
                <div className="text">Type</div>
                <div className="value">{rewardHistory.action_type}</div>
              </div>
              <div className="reward-item amount">
                <div className="text">Amount</div>
                <div className="value">{rewardHistory.amount}</div>
              </div>
              <div className="reward-item date">
                <div>
                  <div className="text">Date</div>
                  <div className="value">
                    {getFullDateTime(rewardHistory.created_at)}
                  </div>
                </div>
                <div className="arrow">
                  <div className="arrow-button">
                    <img src={`${config.STATIC_PATH}/LeftArrow.png`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {wallet.rewardHistories.length === 0 && <span>No Data</span>}
        </div>
      </div>
    );
  }
}

function getFullDateTime(datetime) {
  if (!datetime) return "";
  const dateObj = new Date(datetime);
  const date =
    dateObj.getFullYear() +
    "-" +
    (dateObj.getMonth() + 1) +
    "-" +
    dateObj.getDate();
  const time =
    dateObj.getHours() +
    ":" +
    dateObj.getMinutes() +
    ":" +
    dateObj.getSeconds();
  return date + " " + time;
}
class StakeSection extends React.Component {
  static get propTypes() {
    return {
      title: PropTypes.string,
    };
  }

  render() {
    const style = {
      marginBottom: 25,
    };
    return <div style={style}>{this.props.children}</div>;
  }
}

module.exports = StakePage;
