const path = require('path')
const ipcRenderer = require('electron').ipcRenderer

const { dispatch } = require('../lib/dispatcher')
const WalletConnect = require('@walletconnect/client').default;
const QRCodeModal = require('@walletconnect/qrcode-modal');
const EtherApi = require('../helpers/ether-api')

module.exports = class WalletController {
  constructor (state) {
    this.state = state
    this.state.connector = null;
    this.state.fetching = false;
    this.state.connected = false;
    this.state.pendingRequest = false;
    this.state.chainId = 1;
    this.state.uri = "";
    this.state.accounts = [];
    this.state.address = "";
    this.state.assets = [];
    
  }
  async walletConnect () {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",  // Required
      qrcodeModal: QRCodeModal
    });

    this.state.connector = connector;
    
    // Check if connection is already established
    if (!connector.connected) {
      console.log('create new session')
      // create new session
      await connector.createSession();
      console.log('created new session')
    }

    await this.subscribeToEvents();
  }

  async subscribeToEvents () {
    const { connector } = this.state;
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
    const { connector } = this.state;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  async onConnect (payload) {
    console.log('onConnect', payload);
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    this.state.connected = true;
    this.state.chainId = chainId;
    this.state.accounts = accounts;
    this.state.address = address;
    this.getAccountAssets();
  };

  async getAccountAssets () {
    const { address, chainId } = this.state;
    this.state.fetching = true;
    try {
      // get account balances
      const assets = await EtherApi.apiGetAccountAssets(address, chainId);
      this.state.fetching = false;
      this.state.address = address;
      this.state.assets = assets;
    } catch (error) {
      console.error(error);
      this.state.fetching = false;
    }
  };

  async onDisconnect () {
    this.killSession();
    // this.resetApp();
  };

  async resetApp() {
    this.state.connector = null;
    this.state.fetching = false;
    this.state.connected = false;
    this.state.chainId = 1;
    this.state.uri = "";
  }
}

