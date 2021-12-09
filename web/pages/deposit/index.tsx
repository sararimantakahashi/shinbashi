import type { NextPage, } from 'next';
import styles from './index.module.scss'

import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';
import { Decimal } from 'decimal.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'next-i18next';

import { MetaHead, Navbar, Tabs, Loading } from '../../components';
import utils from '../../utils';
import { useAppContext, useAuthContext } from '../../context';
import Select from 'react-select';
import customSelectStyles from '../../styles/select.js';
import _ from 'lodash';
import { SupportedCryptos } from '../../default';

const Deposit: NextPage = () => {
  const { t } = useTranslation('common');

  const {
    accountId,
    user,
  } = useAuthContext();

  const {
    ethAddress,
    assets,
  } = useAppContext();

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedMetamaskAsset, setSelectedMetamaskAsset] = useState<any>(null);
  const [supportedAssets, setSupportedAssets] = useState<any>([]);
  const [addrAssets, setAddrAssets] = useState<any>([]);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const web3 = utils.getWeb3();

  const tabItems = [
    { label: t('metamask'), value: 'metamask', content: <div>{t('metamask')}</div> },
    { label: t('address'), value: 'address', content: <div>{t('address')}</div> },
  ]

  const router = useRouter();

  useEffect(() => {
    if (utils.tools.loginRequired(router, user)) {
      return ;
    }

    const refresh = async () => {
      setLoading(true);

      let bal = await web3.eth.getBalance(accountId);
      bal = web3.utils.fromWei(bal)

      const tokens = [{
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        abi: require("../../abi/erc20.json")
      }, {
        address: '0xa974c709cfb4566686553a20790685a47aceaa33',
        symbol: 'XIN',
        abi: require("../../abi/erc20.json")
      }]

      const metamaskAssets = [{
        symbol: 'ETH',
        balance: utils.fmt.amount(bal),
        address: accountId,
        abi: ''
      }];

      for (let ix = 0; ix < tokens.length; ix++) {
        const token = tokens[ix];
        const tokenInst = new web3.eth.Contract(token.abi, token.address);

        const bal = await tokenInst.methods.balanceOf(accountId).call();
        const decimal = await tokenInst.methods.decimals().call();
        const adjBal = bal / Math.pow(10, decimal)
        metamaskAssets.push({
          symbol: token.symbol,
          balance: utils.fmt.amount(adjBal),
          address: token.address,
          abi: token.abi,
        });
      }
      setSupportedAssets(metamaskAssets)
      if (metamaskAssets.length > 0) {
        setSelectedMetamaskAsset(metamaskAssets[0]);
      }

      const filteredAssets = assets
        .filter((x) => {
          return (x.asset_id in SupportedCryptos)
        });
      setAddrAssets(filteredAssets);
      if (filteredAssets.length > 0) {
        setSelectedAsset(filteredAssets[0]);
      }
      setLoading(false);
    }
    refresh();
  }, []);

  const changeMetamaskAsset = (newValue:any) => {
    const addr = newValue.value;
    let found = null;
    for (let ix = 0; ix < supportedAssets.length; ix++) {
      const asset = supportedAssets[ix];
      if (addr === asset.address) {
        found = asset;
        break;
      }
    }
    if (found) {
      setSelectedMetamaskAsset(found);
      setAmount('0');
    }
  }

  const changeAsset = (newValue:any) => {
    const addr = newValue.value;
    const found = _.find(addrAssets, { asset_id: addr });
    if (found) {
      setSelectedAsset(found);
    }
  }

  const fillAmount = (e:any) => {
    if (selectedMetamaskAsset) {
      setAmount(selectedMetamaskAsset.balance);
    } else {
      setAmount('0');
    }
    return
  }

  const onAmountChange = (e:any) => {
    setAmount(e.target.value);
  }

  const deposit = async (e:any) => {
    if (selectedMetamaskAsset.symbol === 'ETH') {
      depositEth(e);
    } else {
      depositToken(selectedMetamaskAsset);
    }
  }

  const depositToken = async (token:any) => {
    const tokenInst = new web3.eth.Contract(token.abi, token.address);
    const decimal = await tokenInst.methods.decimals().call();
    const amountDec = (new Decimal(10)).pow(decimal).mul(amount);
    const adjAmount = web3.utils.toBN(amountDec.toNumber());

    console.log(`${accountId} -> ${ethAddress}, ${amountDec}, ${adjAmount} ${token.symbol}`);

    await tokenInst.methods.transfer(ethAddress, adjAmount).send({
      from: accountId
    });
  }

  const depositEth = async (e:any) => {
    const amountWei = web3.utils.toWei(amount, 'ether')

    console.log(`${accountId} -> ${ethAddress}, ${amountWei} wei`);

    const payload:any = {
      from: accountId,
      gas: "30000",
      to: ethAddress,
      value: amountWei,
      data: "a1b2"
    };
    await web3.eth.sendTransaction(payload);
  }

  const validated = () => {
    if (selectedMetamaskAsset && amount) {
      const num = new Decimal(amount);
      if (num.lessThanOrEqualTo(selectedMetamaskAsset.balance) && num.greaterThan(0)) {
        return true;
      }
    }
    return false;
  }

  const onTabItemClick = (item:any, index:number) => {
    console.log(item, index);
  }

  const renderMetamaskSelect = () => {
    const selectOptions = supportedAssets ? supportedAssets.map((x:any) => {
      return { value: x.address, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedMetamaskAsset) {
      selectedOption = _.find(selectOptions, { value: selectedMetamaskAsset.address });
    }
    return (
      <Select options={selectOptions}
        value={selectedOption}
        onChange={changeMetamaskAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const renderSelect = () => {
    const selectOptions = addrAssets ? addrAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedAsset) {
      selectedOption = _.find(selectOptions, { value: selectedAsset.asset_id });
    }
    return (
      <Select options={selectOptions}
        value={selectedOption}
        onChange={changeAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  tabItems[0].content = (
    <div className={styles.form}>
      <div className="row">
        <label htmlFor="deposit-asset-select">
          { t('deposit.select') }
        </label>
        <div className="nes-select">
          {renderMetamaskSelect()}
        </div>
      </div>
      <div className="row">
        <label htmlFor="deposit-amount">{ t('deposit.amount') }</label>
        <input type="number" id="deposit-amount" className="nes-input" value={amount} onChange={onAmountChange}/>
      </div>
      <div className="row" onClick={fillAmount}>
        <div>{ t('deposit.bal') } <span className="nes-text is-primary">{selectedMetamaskAsset?.balance || 0} {selectedMetamaskAsset?.symbol || ''}</span></div>
      </div>
      <div className="row">
        <button  className={"nes-btn block " + (validated() ? 'is-primary' : 'is-disabled')} disabled={!validated()} onClick={deposit}>{ t('deposit') }</button>
      </div>
    </div>
  )

  tabItems[1].content = (
    <div className={styles.form}>
      <div className="row mb-2">
        <label htmlFor="deposit-asset-select">{ t('deposit.select') }</label>
        <div className="nes-select">
          {renderSelect()}
        </div>
      </div>
      <div className="row mb-2">
        <label htmlFor="deposit-asset-select">{ t('deposit.address') }</label>
        <div className="nes-text is-primary mb-2">
          <CopyToClipboard text={selectedAsset?.destination}>
            <span>{selectedAsset?.destination || ''}</span>
          </CopyToClipboard>
        </div>
        <div className="">
          <CopyToClipboard text={selectedAsset?.destination}>
            <button className="nes-btn block is-primary">
              { t("copy") }
            </button>
          </CopyToClipboard>
        </div>
      </div>
      { selectedAsset?.tag ?
        <div className="row mb-2">
          <label htmlFor="deposit-asset-select">{ t('deposit.tag') }</label>
          <div className="nes-text is-primary mt-2">
            <CopyToClipboard text={selectedAsset?.tag}>
              <span>{selectedAsset?.tag || ''}</span>
            </CopyToClipboard>
          </div>
          <div className="">
          <CopyToClipboard text={selectedAsset?.tag}>
            <button className="nes-btn block is-primary">
              { t("copy") }
            </button>
          </CopyToClipboard>
        </div>
        </div>
        : ''
      }
    </div>
  )

  return (
    <div className="page-container">
      <MetaHead title={ t('deposit') } description="Deposit to Shinbashi" />

      <main className="page-main">
        <Loading loading={loading} />

        <Navbar />

        <div className="page-content">
          <Tabs items={tabItems} onClick={onTabItemClick}/>
        </div>
      </main>

    </div>
  )
}

export default Deposit
