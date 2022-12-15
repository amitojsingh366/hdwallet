import * as core from "@shapeshiftoss/hdwallet-core";
import SignClient from "@walletconnect/sign-client";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { WalletConnectHDWallet } from "./walletconnect";
import { WalletConnectV2HDWallet } from "./walletconnectv2";

export type WalletConnectProviderConfigV1 =
  | {
      infuraId: string;
      version: 1;
    }
  | { rpc: { [key: number]: string }; version: 1 };

export type WalletConnectProviderConfigV2 = {
  projectId: string;
  version: 2;
  relayUrl?: string;
};

export type WalletConnectProviderConfig = WalletConnectProviderConfigV1 | WalletConnectProviderConfigV2;

export class WalletConnectAdapter {
  keyring: core.Keyring;
  private providerConfig: WalletConnectProviderConfig;

  private constructor(keyring: core.Keyring, config: WalletConnectProviderConfig) {
    this.keyring = keyring;
    this.providerConfig = config;
  }

  public static useKeyring(keyring: core.Keyring, config: WalletConnectProviderConfig) {
    return new WalletConnectAdapter(keyring, config);
  }

  public async initialize(): Promise<number> {
    return Object.keys(this.keyring.wallets).length;
  }

  public async pairDevice(): Promise<WalletConnectHDWallet | WalletConnectV2HDWallet> {
    try {
      if (!this.providerConfig) {
        throw new Error("WalletConnect provider configuration not set.");
      }

      let wallet;

      if (this.providerConfig.version === 1) {
        const provider = new WalletConnectProvider(this.providerConfig);
        wallet = new WalletConnectHDWallet(provider);
      } else if (this.providerConfig.version === 2) {
        const provider = await SignClient.init(this.providerConfig);
        wallet = new WalletConnectV2HDWallet(provider, this.providerConfig);
      }

      if (!wallet) throw new Error();

      //  Enable session (triggers QR Code modal)
      await wallet.initialize();
      const deviceID = await wallet.getDeviceID();
      this.keyring.add(wallet, deviceID);
      this.keyring.emit(["WalletConnect", deviceID, core.Events.CONNECT], deviceID);
      return wallet;
    } catch (error) {
      console.error("Could not pair WalletConnect");
      throw error;
    }
  }
}
