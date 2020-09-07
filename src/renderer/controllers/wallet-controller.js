const electron = require('electron')
const { dispatch } = require('../lib/dispatcher')
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal');
const EtherApi = require('../helpers/ether-api')
const remote = electron.remote

module.exports = class WalletController {
  constructor (state) {
    this.state = state
    // this.state.wallet.connector = null;
    // this.state.wallet.fetching = false;
    // this.state.wallet.connected = false;
    // this.state.wallet.pendingRequest = false;
    // this.state.wallet.chainId = 1;
    // this.state.wallet.uri = "";
    // this.state.wallet.accounts = [];
    // this.state.wallet.address = "";
    // this.state.wallet.assets = [];
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
      remote.dialog.showMessageBox({
        type: 'warning',
        buttons: ['OK'],
        title: "WalletConnect",
        message: "Login with WalletConnect",
        detail: "To use POPNetwork-Masternode service fully, \n login wallet with walletconnect first."
      })
    }
  }

  async subscribeToEvents () {
    const { connector } = this.state.wallet;
    console.log(connector)
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
      // this.onSessionUpdate(accounts, chainId);
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

      const address = accounts[0];
      // this.setState({
      //   connected: true,
      //   chainId,
      //   accounts,
      //   address,
      // });
      // this.onSessionUpdate(accounts, chainId);
    }

    // this.setState({ connector });
  };

  async killSession () {
    const { connector } = this.state.wallet;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  async onConnect (payload) {
    console.log('onConnect', payload);
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    this.state.wallet.connected = true;
    this.state.wallet.chainId = chainId;
    this.state.wallet.accounts = accounts;
    this.state.wallet.address = address;
    this.getAccountAssets();
  };

  async getAccountAssets () {
    const { address, chainId } = this.state.wallet;
    this.state.wallet.fetching = true;
    try {
      // get account balances
      const assets = await EtherApi.apiGetAccountAssets(address, chainId);
      this.state.wallet.fetching = false;
      this.state.wallet.address = address;
      this.state.wallet.assets = assets;
    } catch (error) {
      console.error(error);
      this.state.wallet.fetching = false;
    }
  };

  async onDisconnect () {
    this.killSession();
    // this.resetApp();
  };

  reset() {
    let wallet = {};
    wallet.connector = null;
    wallet.fetching = false;
    wallet.connected = false;
    wallet.chainId = 1;
    wallet.uri = "";
    this.state.wallet = wallet;
  }
}

