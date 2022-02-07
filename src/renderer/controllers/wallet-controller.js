const electron = require('electron')
const {BigNumber} = require('bignumber.js')
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal');
const EthProvider = require('../services/eth/eth-provider')
const { apiGetRewardHistories, apiGetWallets } = require('../services/api')
const ethConfig = require('../services/eth/config')
const { dispatch } = require('../lib/dispatcher');
const {normalizeAddress} = require('../services/utils');
const { convertUtf8ToHex } = require('@walletconnect/utils');
const remote = electron.remote
const config = require('../../config')

module.exports = class WalletController {
  constructor (state) {
    this.state = state
    this.reset();
    this.state.wallet.address = this.state.saved.wallet.address;
    this.state.wallet.token = this.state.saved.wallet.token;
  }

  selectWalletNetwork(walletNetwork) {
    this.state.saved.wallet.walletNetwork = walletNetwork;
    dispatch('stateSaveImmediate')
  }

  async walletConnect () {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",  // Required
      qrcodeModal: QRCodeModal
    });
    
    this.state.wallet.connector = connector;
    
    // Check if connection is already established
    if (!connector.connected) {
      console.log('create new session')
      // create new session
      await connector.createSession();
      console.log('created new session')
    } else {
      const window = remote.BrowserWindow.getFocusedWindow();
      const {response} = await remote.dialog.showMessageBox(window, {
        type: 'info',
        buttons: ['No', 'Yes'],
        title: "WalletConnect",
        message: "WalletConnect already connected.\n Do you want to disconnect?",
        detail: ""
      })
      if (response == true && connector) {
        this.state.saved.wallet.address = null;
        this.state.saved.wallet.token = null;
        dispatch('stateSaveImmediate');
        this.killSession();
      } 
    }

    await this.subscribeToEvents();
    this.fetchRewardHistories()
  }

  walletDisconnect() {
    this.state.saved.wallet.address = null;
    this.state.saved.wallet.token = null;
    dispatch('stateSaveImmediate');
    this.killSession();
  }

  checkWalletConnect () {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",  // Required
      qrcodeModal: QRCodeModal
    });
    this.state.wallet.connector = connector;
    console.log('connector', connector);
    
    // Check if connection is already established
    if (!connector.connected) {
      const window = remote.BrowserWindow.getFocusedWindow();
      remote.dialog.showMessageBox(window, {
        type: 'warning',
        buttons: ['OK'],
        title: "WalletConnect",
        message: "Login with WalletConnect",
        detail: "To use POPNetwork-Masternode service fully, \n login wallet with walletconnect first. \n Wallet->WalletConnect"
      })
    } else {
      this.subscribeToEvents();
      this.fetchRewardHistories()
    }
  }

  async subscribeToEvents () {
    const { connector } = this.state.wallet;
    
    if (!connector) {
      return;
    }

    console.log(connector.uri)

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      console.log('payload', payload);
      this.onSessionUpdate(accounts, chainId);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }
      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      console.log('connector connected', connector);
      const { chainId, accounts } = connector;
      this.onSessionUpdate(accounts, chainId);
    }

    this.state.wallet.connector = connector;
  };

  async fetchRewardHistories() {
    const { wallet }  = this.state
    if (!wallet || !wallet.address) return
    const rewardHistories = await apiGetRewardHistories(wallet.address, wallet.token)
    wallet.rewardHistories = rewardHistories || []
  }

  async killSession () {
    const { connector } = this.state.wallet;
    if (connector) {
      connector.killSession();
    }
    this.reset();
  };

  async onConnect (payload) {
    console.log('onConnect', payload);
    const { chainId, accounts } = payload.params[0];
	  await this.onSessionUpdate(accounts, chainId);
    this.updateWallet();
	  this.fetchRewardHistories();
  };

  async getAccountAssets () {
    const { address, chainId } = this.state.wallet;
    this.state.wallet.fetching = true;
    try {
      // get account balances
      // const assets = await EtherApi.apiGetAccountAssets(address, chainId);
      this.state.wallet.fetching = false;
      this.state.wallet.address = address;
      // this.state.wallet.assets = assets;
    } catch (error) {
      console.error(error);
      this.state.wallet.fetching = false;
    }
  };

  async onDisconnect () {
    this.killSession();
    // this.resetApp();
  };

  async onSessionUpdate (accounts, chainId) {
    const address = normalizeAddress(accounts[0]);
    this.state.wallet.accounts = accounts;
    this.state.wallet.chainId = chainId;
    const walletNetwork = this.state.saved.wallet.walletNetwork
    const isCorrectNetwork = (config.IS_DEV_NETWORK && chainId === 3 && walletNetwork === 'Ethereum')
    || (!config.IS_DEV_NETWORK && chainId === 1 && walletNetwork === 'Ethereum')
    || (config.IS_DEV_NETWORK && chainId === 97 && walletNetwork === 'BSC')
    || (!config.IS_DEV_NETWORK && chainId === 56 && walletNetwork === 'BSC')
    
    if (!isCorrectNetwork) {
      this.state.modal = {
        id: 'wrong-network-modal',
      }
      this.killSession();
      return
    }
    this.state.wallet.connected = true;
    if (this.state.wallet.address !== address) {
      try {
        const message = "MASTERNODE-TOKEN";
        const hexMsg = convertUtf8ToHex(message);
        const msgParams = [hexMsg, address];
        this.state.modal = {
          id: 'confirm-modal',
        }
        const result = await this.state.wallet.connector.signPersonalMessage(msgParams);
        this.state.modal = null
        this.state.wallet.address = address;
        this.state.wallet.token = result;
        this.state.wallet.fetching = true;
        this.state.saved.wallet.address = this.state.wallet.address;
        this.state.saved.wallet.token = this.state.wallet.token;
        dispatch('stateSaveImmediate')
      } catch (err) {
        console.log('signMessageError: ', err)
        this.state.modal = {
          id: 'connect-error-modal',
        }
      }
    }
  };

  async initWallet() {
    const { wallet } = this.state;
    if (!!wallet ) {
    }
  }

  async updateWallet() {
    const { wallet } = this.state;
    const { chainId } = wallet;
    EthProvider.getProvider(chainId)
    if (this.state.wallet.popPerBlock.isLessThanOrEqualTo(0)) {
      EthProvider.getPopPerBlock().then((result) => {
        if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
          this.state.wallet.popPerBlock = result;
          this.state.wallet.pendingRewards = this.state.wallet.stakedBalance.multipliedBy(this.state.wallet.popPerBlock.multipliedBy(this.state.wallet.cur_cycle_block_cnt))
        }
      });
    }
    if (!!wallet && !!wallet.connected) {
      EthProvider.getEthBalance(wallet.address).then(result => {
        if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
          this.state.wallet.ethBalance = result;
        }
      });
      EthProvider.getTokenBalance(wallet.address).then(result => {
        if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
          this.state.wallet.balance = result;
          EthProvider.getTokenAllowance(wallet.address, ethConfig.STAKING_CONTRACT_ADDRESS[chainId], ethConfig.POP_TOKEN_ADDRESS[chainId]).then(result => {
            if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
              let approval = false;
              if (result.comparedTo(this.state.wallet.balance) == 1) {
                approval = true;
              }
              this.state.wallet.approval = approval;
              this.state.wallet.fetching = false;
            }
          });
        }
      });
      EthProvider.getClaimablePop(wallet.address).then(result => {
        if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
          this.state.wallet.claimableRewards = result;
        }
      });     
      EthProvider.getStakedBalance(wallet.address).then(result => {
        if (!result.isLessThanOrEqualTo(config.ERROR_BALANCE)) {
          this.state.wallet.stakedBalance = result;
          if (result > config.MAX_STAKE_BALANCE) {
            dispatch('maxStakeDialog')
            console.log('2M disconnect cable');
            wallet.isAvailable = false;
          } else if (!wallet.isAvailable) {
            // Reconnect when disconnected
            console.log('API recall');
            wallet.isAvailable = true;
          }

          this.updateWalletAPI();
        }
      });
    }
  }

  async updateWalletAPI() {
    const { wallet } = this.state;
    console.log('call updateWalletAPI', new Date().getTime());
    if (!!wallet && !!wallet.connected && wallet.isAvailable) {
      try {
        const isETH = wallet.chainId === 1 || wallet.chainId === 3
        const walletInfo = await apiGetWallets(wallet.address, wallet.token, wallet.stakedBalance.toFixed(0), isETH ? 'eth' : 'bsc')
        if (walletInfo && walletInfo.cur_cycle_block_cnt) {
          wallet.cur_cycle_block_cnt = walletInfo.cur_cycle_block_cnt;
          console.log('walletInfo', wallet.cur_cycle_block_cnt, new Date().getTime(), new Date().getTime() - wallet.timestamp);
          wallet.timestamp = new Date().getTime();
          state.wallet.pendingRewards = state.wallet.stakedBalance.multipliedBy(state.wallet.popPerBlock.multipliedBy(wallet.cur_cycle_block_cnt))
        }
      } catch (e) {
        console.log("Error GetWallets", e);
      }
    }
  }

  reset() {
    let wallet = {};
    wallet.connector = null;
    wallet.fetching = true;
    wallet.connected = false;
    wallet.chainId = 1;
    wallet.uri = "";
    wallet.balance = new BigNumber(0);
    wallet.stakedBalance = new BigNumber(0);
    wallet.pendingRewards = new BigNumber(0);
    wallet.claimableRewards = new BigNumber(0);
    wallet.pendingBlockCnt = 0;
    wallet.tempPendingBlockCnt = -1;
    wallet.pendingUpdatedTime = 0;
    wallet.popPerBlock = new BigNumber(0);
    wallet.approval = false;
    wallet.address = null;
    wallet.token = null;
    wallet.accounts = [];
    wallet.rewardHistories = [];
    wallet.ethBalance = new BigNumber(0);
    wallet.showWarning = true
    wallet.isAvailable = true
    wallet.cur_cycle_block_cnt = 0;
    wallet.timestamp = new Date().getTime();
    
    this.state.wallet = wallet;
  }
}

