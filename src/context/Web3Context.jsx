import React, { createContext, useContext, useState, useEffect } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [api, setApi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable('Voting DApp');
      if (!extensions.length) {
        alert("No wallet found.");
        return;
      }

      const allAccounts = await web3Accounts();
      if (!allAccounts.length) {
        alert("No accounts available.");
        return;
      }

      const selected = allAccounts[0];
      setAccount(selected);

      const wsProvider = new WsProvider('wss://westend-rpc.dwellir.com'); // ✅ Use Westend node
      const _api = await ApiPromise.create({ provider: wsProvider });
      // console.log("apii", _api);

      setApi(_api);
      setIsConnected(true);
    } catch (err) {
      console.error("Error connecting to wallet:", err);
    }
  };

  return (
    <Web3Context.Provider
      value={{ account, api, isConnected, connectWallet }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3Context);