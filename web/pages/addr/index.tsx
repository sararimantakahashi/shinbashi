import { useRouter, withRouter } from 'next/router'
import styles from './index.module.scss'

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import _ from 'lodash';

import { MetaHead, Navbar, AddrOptionDialog } from '../../components';
import { getAPI } from '../../api';
import { useApiContext, useAuthContext, useCacheContext } from '../../context';

import utils from '../../utils';
import { ETHAssetId } from '../../default';

const AddrIndex = ({ router }: { router:any }) => {
  const { t } = useTranslation('common');

  const {
    accountId,
    user,
    keypair,
  } = useAuthContext();

  const {
    getAsset
  } = useCacheContext();

  const apiCtx = useApiContext();

  const [addresses, setAddresses] = useState<any>([]);

  const [metamaskAddr, setMetamaskAddr] = useState<any>(null);

  const [isEthChain, setIsEthChain] = useState<any>(false);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const [showAddrOptionDialog, setShowAddrOptionDialog] = useState<any>(false);

  const assetId = router.query.asset as string;

  const web3:any = utils.getWeb3();

  const refresh = async () => {
    // read addresses
    if (assetId) {
      const resp = await apiCtx.api.addresses(assetId)
      const addrs = resp.data;

      setAddresses(addrs);

      const found = _.find(addrs, { destination: accountId });
      if (found) {
        setMetamaskAddr(found);
      }

      const asset:any = getAsset(assetId);
      if (asset.chain_id === ETHAssetId) {
        setIsEthChain(true);
      }
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const openAddrOptionDialog = (addr:any) => {
    setSelectedAddress(addr);
    setShowAddrOptionDialog(true);
    return
  }

  const newAddress = () => {
    router.push({
      pathname: '/addr/new',
      query: {
        asset: assetId
      }
    })
  }

  const newMetamaskAddress = async () => {

    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );

    // try to find an existed addr
    let found = metamaskAddr;

    // create an address
    if (found === null) {
      const resp = await apiCtx.api.createAddress(assetId, accountId, "", "master eth address", encryptedPIN);
      found = resp.data;
      const existed = addresses.slice();
      existed.push(found);
      setAddresses(existed);
      setMetamaskAddr(found);
    }
  }

  const chooseAddress = () => {
    if (selectedAddress) {
      router.push({
        pathname: '/withdraw',
        query: {
          address: selectedAddress.address_id,
        }
      });
    }
    setShowAddrOptionDialog(false);
  }

  const deleteAddress = async () => {
    if (selectedAddress) {
      const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
        web3,
        accountId,
        keypair.privateKey,
        user.pin_token_base64,
        user.session_id
      );

      await apiCtx.api.deleteAddress(selectedAddress?.address_id, encryptedPIN);
      const existed = addresses.slice();
      _.remove(existed, { address_id: selectedAddress.address_id });
      setAddresses(existed);
    }
    setShowAddrOptionDialog(false);
  }

  const renderAddresses = () => {
    return addresses.map((address: any) => {
      return (
        <button key={'addr-' + address.address_id} className={"nes-btn block mb-2 " + styles.address_item}
          onClick={() => { openAddrOptionDialog(address) }}>
          <div className={styles.address_item_label}>{address.label}</div>
          <div className={styles.address_item_destination}>{address.destination}</div>
        </button>
      )
    })
  }

  return (
    <div className="page-container">
      <MetaHead title="Addresses"></MetaHead>

      <main className="page-main">
        <Navbar />
        <div className="page-content">
          <div className={styles.hint}>
            { t('address.select') }
          </div>

          <div className={styles.form}>
            {renderAddresses()}
            <button className="nes-btn block mb-2" onClick={newAddress}>
              { t('address.new') }
            </button>
            {metamaskAddr || !isEthChain ? '' : <button className="nes-btn block" onClick={newMetamaskAddress}>
              { t('address.new_meta') }
            </button>}
          </div>
        </div>

      </main>

      {
        selectedAddress ?
        <AddrOptionDialog
          show={showAddrOptionDialog}
          addr={selectedAddress}
          onChoose={chooseAddress} onDelete={deleteAddress}
        /> : ''
      }

    </div>
  )
}

export default withRouter(AddrIndex);
