
import { createContext, useContext, useState } from 'react';
import _ from 'lodash';

import { useApiContext } from '../context';
import { getAPI } from '../api';
import { APIBase } from "../default";
import useSessionStorage from '../hooks/useSessionStorage';

type Props = {
  children: any;
};

type cacheContextType = {
  assetMap: object;
  setAssetMap: (val:any) => void;
  addAsset: (val:any) => void;
  addAssets: (val:any) => void;
  getAsset: (val:any) => void;
  loadAsset: (assetId:string) => void;

  pairs: Array<any>;
  setPairs: (val:any) => void;

  swapMtgInfo: Record<any, any>;
  setSwapMtgInfo: (val:any) => void;
};

const contextDefaultValues: cacheContextType = {
  assetMap: {},
  setAssetMap: () => {},
  addAsset: () => {},
  addAssets: () => {},
  getAsset: () => {},
  loadAsset: () => {},

  pairs: [],
  setPairs: () => {},

  swapMtgInfo: {},
  setSwapMtgInfo: () => {},
};

const CacheContext = createContext(contextDefaultValues);

export function CacheProvider({ children }:Props) {
  const apiCtx = useApiContext();

  const [assetMap, setAssetMap] = useSessionStorage('__cache_asset_map__', {});
  const [pairs, setPairs] = useSessionStorage('__cache_pairs__', []);
  const [swapMtgInfo, setSwapMtgInfo] = useSessionStorage('__cache_swap_mtg_info__', {});

  const addAsset = (asset:any) => {
    const m:Record<string, any> = _.clone(assetMap)
    m[asset.asset_id] = asset;
    setAssetMap(m);
  }

  const addAssets = (assets:any) => {
    const m:Record<string, any> = _.clone(assetMap)
    for (let ix = 0; ix < assets.length; ix++) {
      const asset = assets[ix];
      m[asset.asset_id] = asset;
    }
    setAssetMap(m);
  }

  const getAsset = (assetId:string) => {
    if (assetId in assetMap) {
      return assetMap[assetId];
    }
    return null;
  }

  const loadAsset = async (assetId:string) => {
    const a = getAsset(assetId)
    if (a !== null) {
      return a;
    }
    const resp = await apiCtx.api.asset(assetId);
    if (resp && resp.data && resp.data.asset_id) {
      addAsset(resp.data);
      return resp.data;
    }
    return null;
  }

  const sharedState = {
    assetMap,
    setAssetMap,
    addAsset,
    addAssets,
    getAsset,
    loadAsset,

    pairs, setPairs,

    swapMtgInfo, setSwapMtgInfo,
  }

  return (
    <CacheContext.Provider value={sharedState}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCacheContext() {
  return useContext(CacheContext);
}