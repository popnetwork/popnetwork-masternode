const electron = require('electron')
const {BigNumber} = require('bignumber.js')
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal');
const EthProvider = require('../services/eth/eth-provider')
const config = require('../../config');
const remote = electron.remote
module.exports = class WalletController {
  constructor (state) {
    this.state = state
    this.reset();
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
      remote.dialog.showMessageBox(window, {
        type: 'info',
        buttons: ['OK'],
        title: "WalletConnect",
        message: "WalletConnect already connected.",
        detail: ""
      })
    }

    await this.subscribeToEvents();
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
    const address = accounts[0];
    this.state.wallet.connected = true;
    this.state.wallet.chainId = chainId;
    this.state.wallet.accounts = accounts;
    this.state.wallet.address = address;
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
    const address = accounts[0];
    this.state.wallet.accounts = accounts
    this.state.wallet.address = address
    this.state.wallet.chainId = chainId
    this.state.wallet.connected = true
  };

  async updateWallet() {
    
    const { wallet } = this.state;
    if (!!wallet && !!wallet.connected) {
      const balance = await EthProvider.getTokenBalance(wallet.address, config.POP_TOKEN_ADDRESS);
      this.state.wallet.balance = balance;
      let approval = false;
      const remainingAllowance = await EthProvider.getTokenAllowance(wallet.address, config.STAKING_CONTRACT_ADDRESS, config.POP_TOKEN_ADDRESS);
      if (remainingAllowance.comparedTo(balance) == 1) {
        approval = true;
      }
      this.state.wallet.approval = approval;
    }
  }

  reset() {
    let wallet = {};
    wallet.connector = null;
    wallet.fetching = false;
    wallet.connected = false;
    wallet.chainId = 1;
    wallet.uri = "";
    wallet.balance = new BigNumber(0);
    wallet.stakedBalance = 0;
    wallet.pendingRewards = 0;
    wallet.approval = false;
    wallet.address = 0;
    wallet.accounts = [];
    this.state.wallet = wallet;
  }
}

