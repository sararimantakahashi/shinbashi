import { useRouter, withRouter } from 'next/router'

import styles from './index.module.scss'

import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Decimal } from 'decimal.js';
import { v4 as uuid } from "uuid";
import { useTranslation } from 'next-i18next';
import _ from 'lodash';

import utils from '../../utils';
import { Navbar, Loading, WithdrawResultDialog } from '../../components';
import { getAPI } from '../../api';
import { useApiContext, useAppContext, useAuthContext, useCacheContext } from '../../context';
import Select from 'react-select';
import customSelectStyles from '../../styles/select.js';

const Withdraw = ({router}: {router:any}) => {
  const { t } = useTranslation('common');

  const apiCtx = useApiContext();

  const {
    accountId,
    user,
    keypair,
  } = useAuthContext();

  const {
    assets
  } = useAppContext();

  const {
    getAsset
  } = useCacheContext();

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [supportedAssets, setSupportedAssets] = useState<any>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [amount, setAmount] = useState<any>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showWithdrawResultDialog, setShowWithdrawResultDialog] = useState<boolean>(false);

  const web3 = utils.getWeb3();

  useEffect(() => {
    if (utils.tools.loginRequired(router, user)) {
      return ;
    }
    const refresh = async () => {
      setLoading(true);
      const sorted = utils.tools.filteredAssets(assets);

      setSupportedAssets(sorted);

      // get addr
      const addressId = router.query?.address as string;
      if (addressId) {
        const resp = await apiCtx.api.address(addressId);
        setSelectedAddress(resp.data);
        applyAsset(sorted, resp.data.asset_id);
      }
      setLoading(false);
    }
    refresh();
  }, []);

  const changeAsset = (newValue:any) => {
    const assetId = newValue.value;
    applyAsset(supportedAssets, assetId)
    setSelectedAddress(null);
  }

  const applyAsset = (supported:any, assetId:any) => {
    let found = null;
    for (let ix = 0; ix < supported.length; ix++) {
      const asset = supported[ix];
      if (assetId === asset.asset_id) {
        found = asset;
        break;
      }
    }
    if (found) {
      setSelectedAsset(found);
    }
  }

  const fillAmount = (e:any) => {
    if (selectedAsset) {
      setAmount(selectedAsset.balance);
    } else {
      setAmount(0);
    }
    return
  }

  const onAmountChange = (e:any) => {
    setAmount(e.target.value);
  }

  const withdraw = async (e:any) => {
    setLoading(true);
    console.log(`withdraw ${amount} ${selectedAsset.symbol} to ${selectedAddress.destination}`)

    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );

    // withdraw
    await apiCtx.api.withdraw(selectedAddress.address_id, amount, uuid(), encryptedPIN);

    setLoading(false);
    setShowWithdrawResultDialog(true);
  }

  const validated = () => {
    if (selectedAsset && selectedAddress && amount) {
      const num = new Decimal(amount);
      if (num.lessThanOrEqualTo(selectedAsset.balance) && num.greaterThan(0)) {
        return true;
      }
    }
    return false;
  }

  const validatedAddr = () => {
    if (selectedAsset) {
      return true;
    }
    return false;
  }

  const renderSelect = () => {
    const selectOptions = supportedAssets ? supportedAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedAsset) {
      selectedOption = _.find(selectOptions, { value: selectedAsset.asset_id });
    }
    return (
      <Select
        options={selectOptions}
        value={selectedOption}
        onChange={changeAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const gotoAddressPage = () => {
    router.push({
      pathname: '/addr',
      query: { asset: selectedAsset?.asset_id },
    })
  }

  const renderAddressButton = () => {
    if (selectedAddress && selectedAsset) {
      let chainAsset = selectedAsset;
      if (selectedAsset.chain_id !== selectedAsset.asset_id) {
        chainAsset = getAsset(selectedAsset.chain_id);
      }

      return (
        <div>
          <div className={"nes-btn block mb-2 " + styles.select_addr_btn} onClick={gotoAddressPage}>
            <div><span className="nes-text">{selectedAddress?.label || ''}</span></div>
            <div><span className={"nes-text " + styles.select_addr_btn_dest}>{selectedAddress?.destination || ''}</span></div>
            { selectedAddress?.tag ?
              <div className="row">
                <span className={"nes-text " + styles.select_addr_btn_tag}>{selectedAddress?.tag || ''}</span>
              </div>
              : ''
            }
          </div>
          <div className="nes-text">
            { t('withdraw.fee') } <span className="nes-text is-primary">{selectedAddress?.fee} {chainAsset?.symbol}</span>
          </div>
        </div>
      )
    } else {
      return (
        <button
          className={"nes-btn block " + (validatedAddr() ? '' : 'is-disabled')}
          disabled={!validatedAddr()}
          onClick={gotoAddressPage}
        >{ t('withdraw.select_addr') }</button>
      )
    }
  }


  return (
    <div className="page-container">
      <Head>
        <title>Shinbashi - Withdraw</title>
        <meta name="description" content="Withdraw from Shinbashi" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className="page-main">
        <Loading loading={loading} />
        <Navbar />

        <div className="page-content">
          <div className={styles.form}>
            <div className="row">
              <label htmlFor="withdraw-asset-select">{ t('withdraw.select') }</label>
              <div className="nes-select">
                {renderSelect()}
              </div>
            </div>

            <div className="row">
              <label htmlFor="withdraw-amount">{ t('withdraw.amount') }</label>
              <input type="number" id="withdraw-amount" className="nes-input" value={amount} onChange={onAmountChange}/>
            </div>

            <div className="row" onClick={fillAmount}>
              <div>{ t('withdraw.bal') } <span className="nes-text is-primary">{selectedAsset?.balance || 0} {selectedAsset?.symbol || ''}</span></div>
            </div>

            <div className="row">
              <label htmlFor="withdraw-asset-select">{t('withdraw.dest')}</label>
              {renderAddressButton()}
            </div>

            <div className="row">
              <button className={"nes-btn block " + (validated() ? 'is-primary' : 'is-disabled')} disabled={!validated()} onClick={withdraw}>{ t('withdraw') }</button>
            </div>
          </div>
        </div>

        {
          selectedAsset && selectedAddress && amount ?
          (
            <WithdrawResultDialog
              show={showWithdrawResultDialog}
              asset={selectedAsset}
              amount={amount}
              address={selectedAddress}
              onClose={() => setShowWithdrawResultDialog(false) }
            />
          ): null
        }
      </main>
    </div>
  )
}

export default withRouter(Withdraw);
