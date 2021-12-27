
import type { NextPage } from 'next';
import type { Method, Confidential } from "../../api/types";

import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';
import styles from './index.module.scss'

import { Navbar, SnapshotList, MetaHead, AssetCard, ControlPane } from '../../components';
import { API, HTTP } from '../../api';
import { APIBase, ETHAssetId } from "../../default";
import { useApiContext, useAppContext, useAuthContext, useCacheContext } from '../../context';
import utils from '../../utils';

const Asset: NextPage = () => {
  const {
    user, setUser,
    keypair, setKeypair,
  } = useAuthContext();

  const {
    ethAddress
  } = useAppContext();

  const {
    getAsset
  } = useCacheContext();

  const apiCtx = useApiContext();

  const [snapshots, setSnapshots] = useState<any>([]);

  const router = useRouter();

  const assetId:string = router.query.id as string;

  const cf:Confidential = {
    userId : user?.user_id,
    sessionId : user?.session_id,
    privateKey: keypair?.privateKey
  }

  const client = new HTTP(APIBase, cf, {});

  const api = new API(client);

  const web3:any = utils.getWeb3();

  const fetchSnapshots = async () => {
    const resp:any = await apiCtx.api.snapshots(assetId);
    const snapshots = resp.data;
    setSnapshots(snapshots);
  }

  useEffect(() => {
    if (utils.tools.loginRequired(router, user)) {
      return ;
    }

    const init = async () => {
      const client = new HTTP(APIBase, cf, {});
      const api = new API(client);

      // console.log('ethAddress', ethAddress);
      const deposits = await api.deposits(ETHAssetId, ethAddress)

      // snapshots
      fetchSnapshots();
    };
    init();
  }, [])

  const asset = getAsset(assetId);

  return (
    <div className="page-container">
      <MetaHead title="Assets"></MetaHead>

      <main className="page-main">
        <Navbar />
        <div className="page-content">
          <AssetCard asset={asset} />
          <div className="mb-4">
            <ControlPane web3={web3}/>
          </div>
          <SnapshotList snapshots={snapshots} />
        </div>
      </main>

    </div>
  )
}

export default Asset
