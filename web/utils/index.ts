import * as codec from './codec';
import * as encrypt from './encrypt';
import * as fmt from './fmt';
import * as swap from './swap';
import { Uniswap } from "./swap/uniswap";
import { Curve } from "./swap/curve";
import { PairRoutes } from "./pair/route";
import * as tools from './tools';

import Web3 from "web3";

const detectSupportWallets = () => {
  const w = (window as any);
  if (typeof w && typeof w.ethereum !== 'undefined') {
    console.log('Supported wallet is installed!');
    return true;
  } else {
    console.log('Supported wallet is not installed');
    return false;
  }
}

const getWeb3 = () => {
  const w = (window as any);
  if (w.web3 && w.web3.currentProvider) {
    const web3 = new Web3(w.web3.currentProvider);
    return web3
  }
  return null;
}

export default {
  codec,
  encrypt,
  fmt,
  tools,
  swap,
  detectSupportWallets,
  getWeb3,
  Uniswap,
  Curve,
  pairRoutes: new PairRoutes(),
}