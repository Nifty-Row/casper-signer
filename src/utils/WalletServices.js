import { CasperServiceByJsonRPC } from 'casper-js-sdk';

let casperWalletInstance;

const getCasperWalletInstance = () => {
  try {
    if (casperWalletInstance == null) {
      casperWalletInstance = window.CasperWalletProvider();
    }
    return casperWalletInstance;
  } catch (err) {
    // Catch any errors related to the Casper Wallet Extension
    console.error(err.message);
  }
  return;
};

const WALLET_STORAGE_KEY = 'cspr-redux-wallet-sync';
const GRPC_URL = 'https://casper-node-proxy.dev.make.services/rpc';
const casperService = new CasperServiceByJsonRPC(GRPC_URL);

export class WalletService {
  static activePublicKey = null;
  static extensionLoaded = false;

  static log(msg, payload) {
    console.log(msg, payload);
  }

  static async connect() {
    return getCasperWalletInstance()
      .requestConnection()
      .then((res) => this.log(`Connected response: ${res}`));
  }

  static async switchAccount() {
    return getCasperWalletInstance()
      .requestSwitchAccount()
      .then((res) => this.log(`Switch response: ${res}`));
  }

  static async sign(deployJson, accountPublicKey) {
    return getCasperWalletInstance().sign(deployJson, accountPublicKey);
  }

  static async signMessage(message, accountPublicKey) {
    return getCasperWalletInstance().signMessage(message, accountPublicKey);
  }

  static async disconnect() {
    this.activePublicKey = null;
    return getCasperWalletInstance()
      .disconnectFromSite()
      .then((res) => this.log(`Disconnected response: ${res}`));
  }

  static async isSiteConnected() {
    if (getCasperWalletInstance() && typeof getCasperWalletInstance().isConnected === 'function') {
      return getCasperWalletInstance().isConnected();
    }
    return false;
  }

  static async getActivePublicKey() {
    return getCasperWalletInstance().getActivePublicKey();
  }

  static async getVersion() {
    return getCasperWalletInstance().getVersion();
  }

  static handleConnected(event) {
    this.log('event:connected', event.detail);
    try {
      const action = JSON.parse(event.detail);
      if (action.activeKey) {
        this.activePublicKey = action.activeKey;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  static handleActiveKeyChanged(event) {
    this.log('event:activeKeyChanged', event.detail);
    try {
      const state = JSON.parse(event.detail);
      if (state.activeKey) {
        this.activePublicKey = state.activeKey;
      } else {
        this.activePublicKey = null;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  static handleDisconnected(event) {
    this.log('event:disconnected', event.detail);
    try {
      if (this.activePublicKey) {
        this.activePublicKey = null;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  static handleTabChanged(event) {
    this.log('event:tabChanged', event.detail);
    try {
      const action = JSON.parse(event.detail);
      if (action.activeKey) {
        this.activePublicKey = action.activeKey;
      } else {
        this.activePublicKey = null;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  static handleLocked(event) {
    this.log('event:locked', event.detail);
    try {
      // Handle lock event
    } catch (err) {
      this.handleError(err);
    }
  }

  static handleUnlocked(event) {
    this.log('event:unlocked', event.detail);
    try {
      const action = JSON.parse(event.detail);
      if (action.activeKey) {
        this.activePublicKey = action.activeKey;
      } else {
        this.activePublicKey = null;
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  static subscribeToEvents() {
    window.addEventListener('CasperWalletEventTypes.Connected', (event) =>
      this.handleConnected(event)
    );
    window.addEventListener(
      'CasperWalletEventTypes.ActiveKeyChanged',
      (event) => this.handleActiveKeyChanged(event)
    );
    window.addEventListener('CasperWalletEventTypes.Disconnected', (event) =>
      this.handleDisconnected(event)
    );
    window.addEventListener('CasperWalletEventTypes.TabChanged', (event) =>
      this.handleTabChanged(event)
    );
    window.addEventListener('CasperWalletEventTypes.Locked', (event) =>
      this.handleLocked(event)
    );
    window.addEventListener('CasperWalletEventTypes.Unlocked', (event) =>
      this.handleUnlocked(event)
    );
  }

  static unsubscribeFromEvents() {
    window.removeEventListener('CasperWalletEventTypes.Connected', (event) =>
      this.handleConnected(event)
    );
    window.removeEventListener(
      'CasperWalletEventTypes.ActiveKeyChanged',
      (event) => this.handleActiveKeyChanged(event)
    );
    window.removeEventListener('CasperWalletEventTypes.Disconnected', (event) =>
      this.handleDisconnected(event)
    );
    window.removeEventListener('CasperWalletEventTypes.TabChanged', (event) =>
      this.handleTabChanged(event)
    );
    window.removeEventListener('CasperWalletEventTypes.Locked', (event) =>
      this.handleLocked(event)
    );
    window.removeEventListener('CasperWalletEventTypes.Unlocked', (event) =>
      this.handleUnlocked(event)
    );
  }

  static handleError(err) {
    console.log(err);
  }

//   static init() {
//     let timer;

//     if (window.CasperWalletEventTypes != null) {
//       this.extensionLoaded = true;
//       clearTimeout(timer);
//     } else {
//       timer = setTimeout(() => {
//         this.init();
//       }, 500);
//     }
//   }
}

// Initialize the WalletService
// WalletService.init();
