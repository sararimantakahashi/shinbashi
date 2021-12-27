import type { NextPage, } from 'next';
import styles from './index.module.scss'
import { useRouter, withRouter } from 'next/router'

import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Decimal } from 'decimal.js';
import { v4 as uuid } from "uuid";
import _ from 'lodash';
import { useTranslation } from 'next-i18next';

import { Navbar, SwapResultDialog } from '../../components';
import utils from '../../utils';
import { useAppContext, useAuthContext, useCacheContext, useApiContext } from '../../context';
import Select from 'react-select';
import customSelectStyles from '../../styles/select.js';
import { SupportedCryptos } from '../../default';


const Swap: NextPage = () => {
  const { t } = useTranslation('common');

  const {
    user,
    keypair,
    accountId
  } = useAuthContext();

  const {
    assets,
    setLoading
  } = useAppContext();

  const cacheCtx = useCacheContext();
  const apiCtx = useApiContext();

  const [inputAmount, setInputAmount] = useState<any>(0);
  const [outputAmount, setOutputAmount] = useState<any>(0);
  const [inputAssets, setInputAssets] = useState<any>([]);
  const [outputAssets, setOutputAssets] = useState<any>([]);
  const [selectedInputAsset, setSelectedInputAsset] = useState<any>(null);
  const [selectedOutputAsset, setSelectedOutputAsset] = useState<any>(null);

  const [routes, setRoutes] = useState<string>("");

  const [priceImpact, setPriceImpact] = useState<string>("");
  const [priceImpactStyle, setPriceImpactStyle] = useState<string>("");

  // const [loading, setLoading] = useState<boolean>(false);

  const [showSwapResultDialog, setShowSwapResultDialog] = useState<boolean>(false);
  const [swapResult, setSwapResult] = useState<boolean>(false);

  const router = useRouter();
  useEffect(() => {
    setLoading(true);
    if (utils.tools.loginRequired(router, user)) {
      return ;
    }
    const refresh = async () => {
      setInputAssets(assets.filter((x:any) => {
        return x.balance !== '0';
      }));
      await fetchData();
      setLoading(false);
    }
    refresh();
  }, []);

  useEffect(() => {
    console.log('assetMap changed!', Object.keys(cacheCtx.assetMap).length)
  } , [cacheCtx.assetMap]);

  const fetchData = async () => {
    // fetch and cache mtg info
    // @TODO cache it in the localStorage
    const mtg = await apiCtx.swapApi.mtg();
    cacheCtx.setSwapMtgInfo(mtg.data);

    // read pairs from swap and make routes
    const resp = await apiCtx.swapApi.pairs();
    const pairData = resp.data;
    const pairsJson = pairData.pairs;

    pairsJson.sort((a:any, b:any) => {
      const aLiquidity = Number(a.base_value) + Number(a.quote_value);
      const bLiquidity = Number(b.base_value) + Number(b.quote_value);
      return bLiquidity - aLiquidity;
    });
    cacheCtx.setPairs(pairsJson);
    utils.pairRoutes.makeRoutes(pairsJson);

    // get supported assets.
    const assetIds = await utils.swap.getAssets(pairsJson)
      .filter((x) => {
        return (x in SupportedCryptos)
      });

    // fetch assets by asset ids
    const needToLoadIds = [];
    for (let ix = 0; ix < assetIds.length; ix++) {
      const aid = assetIds[ix];
      if (cacheCtx.getAsset(aid) === null) {
        needToLoadIds.push(aid);
      }
    }

    // load from Mixin API
    // @TODO cache it in the localStorage
    const promises = needToLoadIds.map(async (assetId:string) => {
      return await cacheCtx.loadAsset(assetId);
    });
    await Promise.all(promises);

    const assets = assetIds.map((assetId:string) => {
      return cacheCtx.getAsset(assetId)
    }).filter((a:any) => {
      return a !== null;
    })

    setOutputAssets(assets);
  }

  const changeInputAsset = (newValue:any) => {
    const assetId = newValue.value;
    const found = _.find(inputAssets, { asset_id: assetId });
    if (found) {
      setSelectedInputAsset(found);
      if (selectedOutputAsset) {
        updateRoute(found.asset_id, selectedOutputAsset.asset_id, inputAmount, outputAmount);
      }
    }
  }

  const changeOutputAsset = (newValue:any) => {
    const assetId = newValue.value;
    const found = _.find(outputAssets, { asset_id: assetId });
    if (found) {
      setSelectedOutputAsset(found);
      if (selectedInputAsset) {
        updateRoute(selectedInputAsset.asset_id, found.asset_id, inputAmount, outputAmount);
      }
    }
  }

  const fillInputAmount = (e:any) => {
    if (selectedInputAsset) {
      setInputAmount(selectedInputAsset.balance);
    } else {
      setInputAmount('0');
    }
    if (selectedOutputAsset) {
      updateRoute(selectedInputAsset.asset_id, selectedOutputAsset.asset_id, selectedInputAsset.balance, outputAmount);
    }
    return
  }

  const onInputAmountChange = (e:any) => {
    setInputAmount(e.target.value);
    if (selectedInputAsset && selectedOutputAsset) {
      updateRoute(selectedInputAsset.asset_id, selectedOutputAsset.asset_id, e.target.value, outputAmount);
    }
  }

  const onOutputAmountChange = (e:any) => {
    setOutputAmount(e.target.value);
    // updateRoute(selectedInputAsset.asset_id, selectedOutputAsset.asset_id, inputAmount, e.target.value);
  }

  const validated = () => {
    if (selectedInputAsset && outputAmount && inputAmount) {
      if (new Decimal(outputAmount).greaterThan(0)
        && new Decimal(inputAmount).lessThanOrEqualTo(selectedInputAsset.balance)) {
        return true;
      }
    }
    return false;
  }

  const doSwap = async (e:any) => {
    setLoading(true);

    const traceId = uuid()
    const followId = uuid()
    const web3:any = utils.getWeb3();

    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );

    const minimum = new Decimal(outputAmount).mul(0.99).toFixed(8); // slippage = 1%

    const action = `3,${user.user_id},${followId},${selectedOutputAsset.asset_id},${routes},${minimum}`;

    const actionResp = await apiCtx.swapApi.action({
      action, amount: inputAmount, asset_id: selectedInputAsset.asset_id, broker_id: '', trace_id: ''
    })

    await apiCtx.api.transactions({
      asset_id: selectedInputAsset.asset_id,
      amount: inputAmount,
      trace_id: traceId,
      pin: encryptedPIN,
      memo: actionResp.data.action,
      opponent_multisig: {
        receivers: cacheCtx.swapMtgInfo.members,
        threshold: cacheCtx.swapMtgInfo.threshold,
      }
    });

    // @TODO check result
    // checkSwapResult(followId);

    setLoading(false);
    setShowSwapResultDialog(true);
  }

  const checkSwapResult = (followId:string) => {
    let checking = true;
    const checkProd = async () => {
      if (checking) {
        const resp = await apiCtx.swapApi.order(followId)
        if (resp & resp.data) {
          if (resp.data.state === 'Done') {
            setSwapResult(resp.data);
            setShowSwapResultDialog(true);
            checking = false;
            return;
          }
        }
        setTimeout(checkProd, 1000);
      }
    }
    setTimeout(() => checkProd(), 1000);
  }

  const updateRoute = async (inputAssetId:string, outputAssetId:string, inputAmount:string, outputAmount:string) => {
    const result = await utils.pairRoutes.getPreOrder({
      inputAsset: inputAssetId,
      outputAsset: outputAssetId,
      inputAmount: inputAmount,
      outputAmount: outputAmount,
    })

    setOutputAmount(result.amount);
    const priceImpactDec = new Decimal(result.price_impact).times(100);
    setPriceImpact(priceImpactDec.toFixed(4) + '%');
    if (priceImpactDec.greaterThan("5")) {
      setPriceImpactStyle('is-warning');
    } else if (priceImpactDec.greaterThan("10")) {
      setPriceImpactStyle('is-error');
    } else {
      setPriceImpactStyle('is-success');
    }
    setRoutes(result.routes);
  }

  const renderInputSelect = () => {
    const selectOptions = inputAssets ? inputAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedInputAsset) {
      selectedOption = _.find(selectOptions, { value: selectedInputAsset.asset_id });
    }
    return (
      <Select
        options={selectOptions}
        value={selectedOption}
        onChange={changeInputAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const renderOutputSelect = () => {
    const selectOptions = outputAssets ? outputAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedOutputAsset) {
      selectedOption = _.find(selectOptions, { value: selectedOutputAsset.asset_id });
    }
    return (
      <Select
        options={selectOptions}
        value={selectedOption}
        onChange={changeOutputAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  return (
    <div className="page-container">
      <Head>
        <title>Shinbashi - {t('swap')} </title>
        <meta name="description" content="Deposit to Shinbashi" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className="page-main">
        <Navbar />

        <div className="page-content">
          <div className={styles.form}>
            <label htmlFor="input-asset-select">{t('swap.from')} </label>
            <div className={"row " + styles.one_line_row}>
              <input type="number" id="input-amount" className="nes-input" value={inputAmount} onChange={onInputAmountChange}/>
              <div className={"nes-select " + styles.select}>
                {renderInputSelect()}
              </div>
            </div>

            <div className="row" onClick={fillInputAmount}>
              <div>{t('bal')} <span className="nes-text is-primary">{selectedInputAsset?.balance || 0} {selectedInputAsset?.symbol || ''}</span></div>
            </div>

            <div className="row mb-4">
              <label htmlFor="deposit-asset-select">{t('swap.to')} </label>
              <div className={"row " + styles.one_line_row}>
                <input type="number" id="output-amount" className="nes-input" readOnly disabled value={outputAmount} onChange={onOutputAmountChange}/>
                <div className={"react-select-wrapper " + styles.select}>
                  {renderOutputSelect()}
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div>{t('swap.price_impact')} <span className={"nes-text " + priceImpactStyle}>{priceImpact}</span></div>
            </div>

            <div className="row">
              <button  className={"nes-btn block " + (validated() ? 'is-primary' : 'is-disabled')} disabled={!validated()} onClick={doSwap}>{t('swap')} </button>
            </div>
          </div>
        </div>

        <SwapResultDialog
          show={showSwapResultDialog}
          result={swapResult}
          onClose={() => setShowSwapResultDialog(false)}
          onHome={() => router.push('/') }
        />
      </main>
    </div>
  )
}

export default Swap;
