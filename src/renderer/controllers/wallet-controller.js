const electron = require('electron')
const {BigNumber} = require('bignumber.js')
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal');
const EthProvider = require('../services/eth/eth-provider')
const sConfig = require('../../sconfig');
const { dispatch } = require('../lib/dispatcher');
const {normalizeAddress} = require('../services/utils');
const { convertUtf8ToHex } = require('@walletconnect/utils');
const { openDialog } = require('electron-custom-dialog')
const remote = electron.remote
module.exports = class WalletController {
  constructor (state) {
    this.state = state
    this.reset();
    this.state.wallet.address = this.state.saved.wallet.address;
    this.state.wallet.token = this.state.saved.wallet.token;
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
    await this.onSessionUpdate(accounts, chainId);
    dispatch('disconnectActionCable');
    dispatch('connectActionCable');
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
    dispatch('disconnectActionCable');
  };

  async onSessionUpdate (accounts, chainId) {
    const address = normalizeAddress(accounts[0]);
    this.state.wallet.accounts = accounts;
    this.state.wallet.chainId = chainId;
    this.state.wallet.connected = true;
    if (this.state.wallet.address !== address) {
      try {
        const message = "MASTERNODE-TOKEN";
        const hexMsg = convertUtf8ToHex(message);
        const msgParams = [hexMsg, address];
        openDialog('pendingDlg').then((result) => {
        })
        const result = await this.state.wallet.connector.signPersonalMessage(msgParams);
        remote.BrowserWindow.getAllWindows()
          .filter(b => {
            if (b.getTitle() == "PENDING") {
              b.close()
            }
          })
        this.state.wallet.address = address;
        this.state.wallet.token = result;
        this.state.wallet.fetching = true;
        this.state.saved.wallet.address = this.state.wallet.address;
        this.state.saved.wallet.token = this.state.wallet.token;
        dispatch('stateSaveImmediate')
      } catch (err) {
        console.log('signMessageError: ', err)
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
    if (this.state.wallet.popPerBlock.isLessThanOrEqualTo(0)) {
      EthProvider.getPopPerBlock().then((result) => {
        this.state.wallet.popPerBlock = result;
        this.state.wallet.pendingRewards = this.state.wallet.stakedBalance.multipliedBy(this.state.wallet.popPerBlock.multipliedBy(this.state.wallet.pendingBlockCnt))
      });
    }
    if (!!wallet && !!wallet.connected) {
      EthProvider.getTokenBalance(wallet.address).then(result => {
        this.state.wallet.balance = result;
        EthProvider.getTokenAllowance(wallet.address, sConfig.STAKING_CONTRACT_ADDRESS, sConfig.POP_TOKEN_ADDRESS).then(result => {
          let approval = false;
          if (result.comparedTo(this.state.wallet.balance) == 1) {
            approval = true;
          }
          this.state.wallet.approval = approval;
          this.state.wallet.fetching = false;
        });
      });
      EthProvider.getClaimablePop(wallet.address).then(result => {
        this.state.wallet.claimableRewards = result;
      });     
      EthProvider.getStakedBalance(wallet.address).then(result => {
        this.state.wallet.stakedBalance = result;
      });
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
    wallet.popPerBlock = new BigNumber(0);
    wallet.approval = false;
    wallet.address = null;
    wallet.token = null;
    wallet.accounts = [];
    
    this.state.wallet = wallet;
  }
}

