const React = require("react");

const config = require("../../config");
const { apiGetStakeConfig } = require('../services/api')
const { dispatch, dispatcher } = require('../lib/dispatcher')
const CustomButton = require("../components/custom-button");

class StakePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stakeConfig: {
        apy: 0,
        min_stake_amount: 0,
      },
    }
    this.onStake = this.onStake.bind(this)
    this.onHideWarning = this.onHideWarning.bind(this)
  }

  componentDidMount() {
    this.getStakeConfig()
  }

  async getStakeConfig() {
    const config = await apiGetStakeConfig()
    this.setState({ stakeConfig: config })
  }

  onStake() {
    dispatch('stake')
  }

  onHideWarning() {
    this.props.state.wallet.showWarning = false
  }

  render() {
    const { wallet } = this.props.state
    return (
      <div className="stake-first-page">
        {wallet.showWarning && (
          <div className="header-content">
            <div className="text">Warning: Pending Rewards will be initialized when you Stake/Claim/Unstake POP</div>
            <div className="close-btn" onClick={this.onHideWarning}>
              <img src={`${config.STATIC_PATH}/Close.png`} draggable={false} />
            </div>
          </div>
        )}
        <div className="page-container">
          <div className="main-content">
            <div className="content-title">Staking POP</div>
            <div className="sub-title">Deposit your POP here and keep your<br/>Masternode running to earn POP rewards</div>
            <div className="content-wrapper">
              <div className="content-item">
                <div className="type">Minimum Stake</div>
                <div className="value">{`50,000 POP`}</div>
              </div>
            </div>
            <div className="content-text">
              Keeping your Masternode running while staking POP earns you rewards while strengthening our decentralized content distribution network. <br /><br />
              You only earn rewards while your Masternode is running.
            </div>
            <CustomButton
              label="Stake"
              onClick={this.onStake}
              style={{
                background: "#B169F6",
                width: 150,
                height: 40,
                marginTop: 24
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = StakePage;
