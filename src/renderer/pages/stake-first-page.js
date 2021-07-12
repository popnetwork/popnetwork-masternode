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
      }
    }
    this.onStake = this.onStake.bind(this)
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

  render() {
    return (
      <div className="stake-first-page">
        <div className="header-content">
          <div className="text">Warning: Pending ewwards will be initialized when you Stake/Claim/Unstake POP</div>
          <div className="close-btn">
            <img src={`${config.STATIC_PATH}/Close.png`} />
          </div>
        </div>
        <div className="page-container">
          <div className="main-content">
            <div className="content-title">Staking POP</div>
            <div className="sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit. </div>
            <div className="content-wrapper">
              <div className="content-item">
                <div className="type">APR</div>
                <div className="value">{this.state.stakeConfig.apy}</div>
              </div>
              {/* <div className="content-item">
                <div className="type">Potential earnings</div>
                <div className="value">12376543.000000 POP</div>
              </div> */}
              <div className="content-item">
                <div className="type">Min. to Stake</div>
                <div className="value">{`${this.state.stakeConfig.min_stake_amount} POP`}</div>
              </div>
            </div>
            <div className="content-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tristique blandit sem eget dignissim. Sed ullamcorper elementum luctus. Donec eu lectus lobortis, rutrum justo ut, ullamcorper augue. <br /><br />
              Pellentesque auctor porttitor porttitor. Sed dictum sem sit amet tortor lacinia consequat. Sed tellus massa, convallis vitae nisl in, eleifend dictum mi. Nunc finibus urna tempus dui condimentum egestas. Curabitur maximus velit tincidunt semper tempus.
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
