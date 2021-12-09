import { createContext, useContext, useState } from 'react';

import { AuthProvider, useAuthContext } from './auth';
import { CacheProvider, useCacheContext } from './cache';
import { ApiProvider, useApiContext } from './api';

import { getAPI } from '../api';
import { ETHAssetId } from "../default";

type Props = {
  children: any;
};

type appContextType = {
  assets: Array<any>;
  setAssets: (val:any) => void;
  web3: any;
  setWeb3: (val:any) => void;
  ethAddress: string;
  setEthAddress: (val:any) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (val:any) => void;

  loadAssets: (apiAlt:any) => void;
};

const contextDefaultValues: appContextType = {
  assets: [],
  setAssets: () => {},
  web3: null,
  setWeb3: () => {},
  ethAddress: '',
  setEthAddress: () => {},

  sidebarOpen: false,
  setSidebarOpen: () => {},

  loadAssets: () => {},
};

const AppContext = createContext(contextDefaultValues);

export function AppProvider({ children }:Props) {

  const cacheContext = useCacheContext();
  const apiContext = useApiContext();

  const [assets, setAssets] = useState<any>([]);
  const [web3, setWeb3] = useState<any>(null);
  const [ethAddress, setEthAddress] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const loadAssets = async (apiAlt:any) => {
    const resp = await (apiContext.api || apiAlt).assets();
    const assets = resp.data;

    // read eth address
    let foundEth = false;
    for (let ix = 0; ix < assets.length; ix++) {
      const item = assets[ix];
      if (item.asset_id === ETHAssetId) {
        foundEth = true;
        setEthAddress(item.destination)
        break;
      }
    }
    if (!foundEth) {
      const resp = await (apiContext.api || apiAlt).asset(ETHAssetId);
      assets.push(resp.data);
      setEthAddress(resp.data.destination)
    }

    // save to cache state
    cacheContext.addAssets(assets)

    // save to state
    setAssets(assets);

    return assets;
  }

  const sharedState = {
    assets, setAssets,
    web3, setWeb3,
    ethAddress, setEthAddress,
    sidebarOpen, setSidebarOpen,
    loadAssets,
  }

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}

export {
  AuthProvider,
  useAuthContext,
  CacheProvider,
  useCacheContext,
  ApiProvider,
  useApiContext,
}