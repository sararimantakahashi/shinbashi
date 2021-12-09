
import { createContext, useContext, useState } from 'react';
import _ from 'lodash';

import { useAuthContext } from '../context';
import { getAPI, getSwapAPI } from '../api';

type Props = {
  children: any;
};

type apiContextType = {
  api: any;
  swapApi: any;
  initApis: (a:any, b:any) => any;
  onError: (a:number, b:string) => any;
  clearError: () => any;
  errno: number,
  setErrno: (val:number) => void;
  errmsg: string,
  setErrmsg: (val:string) => void;
};

const contextDefaultValues: apiContextType = {
  api: null,
  swapApi: null,
  initApis: () => {},
  errno: 0,
  onError: () => {},
  clearError: () => {},
  setErrno: () => {},
  errmsg: '',
  setErrmsg: () => {},
};

const ApiContext = createContext(contextDefaultValues);

export function ApiProvider({ children }:Props) {
  // const { user, keypair } = useAuthContext();

  let [api, setApi] = useState<any>(null);
  let [swapApi, setSwapApi] = useState<any>(null);
  let [errno, setErrno] = useState<number>(0);
  let [errmsg, setErrmsg] = useState<string>('');

  const onError = (code:number, description:string) => {
    console.log('catch an error:', code, description);
    setErrno(code);
    setErrmsg(description);
  }

  const clearError = () => {
    setErrno(0);
    setErrmsg('');
  }

  const initApis = (u:any, kp:any) => {
    const a = getAPI(u, kp, onError);
    setApi(a);
    const sa = getSwapAPI(u, kp, onError)
    setSwapApi(sa);
    return { api: a, swapApi: sa }
  }

  const sharedState = {
    api, swapApi, initApis,
    onError, clearError,
    errno, setErrno,
    errmsg, setErrmsg
  }

  return (
    <ApiContext.Provider value={sharedState}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  return useContext(ApiContext);
}