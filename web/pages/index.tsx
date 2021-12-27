import type { NextPage } from 'next';
import type { Method, Confidential } from "../api/types";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import styles from '../styles/Home.module.scss'

import {
  Loading,
  Intro,
  MetaHead,
  ConnectWalletArea, InitAccountArea,
  Navbar, AssetList,
  ConnectWalletDialog,
  ControlPane,
  Summary,
} from '../components';

import utils from '../utils';
import { API, getAPI, HTTP } from '../api';
import { APIBase, AccessEndpoint, SignInputAccountTpl, SignInputPINTpl, ETHAssetId } from "../default";
import { useAppContext, useAuthContext, useApiContext } from '../context';
import Decimal from 'decimal.js';

const Home: NextPage = () => {
  const { t } = useTranslation('common');

  const apiCtx = useApiContext();

  const authContext = useAuthContext();
  const {
    accountId, setAccountId,
    user, setUser,
    keypair, setKeypair,
    accountState, setAccountState,
    connected, setConnected,
  } = authContext;

  const {
    assets,
    web3, setWeb3,
    loadAssets,
    setLoading,
  } = useAppContext();

  const [showConnectDialog, setShowConnectDialog] = useState(false);


  const [totalFiatBalance, setTotalFiatBalance] = useState('0.00');

  useEffect(() => {
    setLoading(true);
    const init = (async ()=> {
      if (connected && accountState === 2) {
        // console.log(apiCtx.api)
        loadAssets(getAPI(user, keypair));
      }
    })
    init();
    setLoading(false);
  }, [accountState, connected])

  useEffect(() => {
    let total = new Decimal(0);
    for (let ix = 0; ix < assets.length; ix++) {
      const bal = new Decimal(assets[ix].balance)
      total = total.add(bal.times(assets[ix].price_usd));
    }
    setTotalFiatBalance(total.toFixed(2));
  }, [assets])

  const sign = async () => {
    setLoading(true);
    const w = window as any;
    const web3:any = utils.getWeb3();

    if (web3 === null) {
      return
    }

    web3.eth.net.isListening()
      .then(() => setConnected(true) )
      .catch((e:any) => w.__WEB3_CONNECT_ERROR__ = e.toString());

    // w.ethereum.enable();
    await w.ethereum.send('eth_requestAccounts')
    await setWeb3(web3);

    const accounts = await web3.eth.getAccounts();

    var from = accounts[0];
    await setAccountId(from);

    const data = SignInputAccountTpl.replace("$ID$", from);
    const sig = await web3.eth.personal.sign(data, from, "");

    // test the signature
    // const signer = await web3.eth.personal.ecRecover(data, sig)
    // console.log('signer', signer);

    const kp = utils.encrypt.generateKeypair(sig);
    await setKeypair(kp);

    // register and fetch user data
    const client = new HTTP(AccessEndpoint, null, {});
    const api = new API(client);

    const resp = await api.register("test user", kp.publicKey);
    const u = resp.data;
    await setUser(u);

    // init api provider
    const apis = apiCtx.initApis(u, kp);
    console.log(apis);

    if (!u.has_pin) {
      setAccountState(1);
    } else {
      setAccountState(2);
      loadAssets(apis.api);
    }

    setLoading(false);

    console.log(u);

    setShowConnectDialog(false);
  }

  const unlockWallet = async () => {
    const w = window as any;
    try {
      await w.ethereum.send('eth_requestAccounts')
    } catch (e:any) {
      if (e.code === -32002) {
        window.location.reload();
      }
    }
  }

  const initAccount = async (name:string) => {
    setLoading(true);
    // setup PIN and set user name
    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );

    // setup PIN
    let resp = await apiCtx.api.updatePIN("", encryptedPIN);

    // setup name
    resp = await apiCtx.api.updateMe(name);

    setAccountState(2);
    loadAssets(getAPI(user, keypair));

    setLoading(false);
  }

  const openConnectDialog = () => {
    setShowConnectDialog(true);
  }

  const closeConnectDialog = () => {
    setShowConnectDialog(false);
  }

  const connectWallet = async (id:string) => {
    await sign()
    return id
  }


  let renderContent = (
    <div>
      <Intro />
      <ConnectWalletArea onConnect={openConnectDialog} onUnlock={unlockWallet}/>
    </div>
  );

  if (connected) {
    if (accountState === 0) {
      // pass
    } else if (accountState === 1) {
      renderContent = (
        <InitAccountArea onInitialize={initAccount} />
      )
    } else if (accountState === 2) {
      renderContent = (
        <div className={styles.content}>
          <Summary balance={totalFiatBalance} />
          <ControlPane web3={web3} />
          <AssetList assets={assets}></AssetList>
        </div>
      )
    }
  }


  return (
    <div className="page-container">
      <MetaHead />

      <main className="page-main">

        <Navbar />

        <div className="page-content">
          {renderContent}
        </div>

      </main>

      <ConnectWalletDialog show={showConnectDialog} onClose={closeConnectDialog} onConnect={connectWallet} />

      <footer className={styles.footer}>
        { t('copy_right') }
        {/* <div>
          <button className="nes-btn is-primary" onClick={updatePIN}>update pin</button>
        </div> */}
      </footer>
    </div>
  )
}

export default Home
