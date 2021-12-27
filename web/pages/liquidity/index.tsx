import type { NextPage, } from 'next';
import styles from './index.module.scss'

import { useRouter } from 'next/router';

import React, { useEffect, useState } from 'react';
import { Decimal } from 'decimal.js';
import { useTranslation } from 'next-i18next';
import { v4 as uuid } from "uuid";
import Select from 'react-select';

import utils from '../../utils';
import { MetaHead, Navbar, Tabs,
  AddLiquidityResultDialog,
  RemoveLiquidityResultDialog
} from '../../components';
import { useAppContext, useAuthContext, useCacheContext, useApiContext } from '../../context';
import { getAPI, getSwapAPI } from '../../api';

import customSelectStyles from '../../styles/select.js';
import _ from 'lodash';

const LiquidityManagementPage: NextPage = () => {
  const { t } = useTranslation('common');

  const {
    accountId,
    user, keypair
  } = useAuthContext();

  const {
    assets,
    setLoading,
  } = useAppContext();

  const cacheCtx = useCacheContext();
  const apiCtx = useApiContext();

  const [selectedAddAsset1, setSelectedAddAsset1] = useState<any>(null);
  const [selectedAddAsset2, setSelectedAddAsset2] = useState<any>(null);
  const [selectedRemoveAsset, setSelectedRemoveAsset] = useState<any>(null);
  const [addAssets, setAddAssets] = useState<any>([]);
  const [removeAssets, setRemoveAssets] = useState<any>([]);
  const [addPairs, setAddPairs] = useState<any>([]);
  const [existedPair, setExistedPair] = useState<any>(null);
  const [scale, setScale] = useState<number>(0.0);

  const [addAmount1, setAddAmount1] = useState<string>("");
  const [addAmount2, setAddAmount2] = useState<string>("");
  const [removeAmount, setRemoveAmount] = useState<string>("");
  // const [loading, setLoading] = useState<boolean>(false);
  const [showAddLiquidityResultDialog, setShowAddLiquidityResultDialog] = useState<boolean>(false);
  const [showRemoveLiquidityResultDialog, setShowRemoveLiquidityResultDialog] = useState<boolean>(false);

  const web3 = utils.getWeb3();

  const tabItems = [
    { label: t('liquidity.add'), value: 'add', content: <div>{t('liquidity.add')}</div> },
    { label: t('liquidity.remove'), value: 'remove', content: <div>{t('liquidity.remove')}</div> },
  ]

  const router = useRouter();

  useEffect(() => {
    if (utils.tools.loginRequired(router, user)) {
      return ;
    }

    const refresh = async () => {
      const balanceAssets = assets.filter((x:any) => {
        return x.balance !== '0';
      })
      const data = await fetchData();

      // merge assets and balanceAssets
      let merged = data.assets.slice();
      for (let ix = 0; ix < balanceAssets.length; ix++) {
        const a:any = balanceAssets[ix];
        const found = _.find(merged, { asset_id: a.asset_id });
        if (!found) {
          merged = [...merged, a];
        }
      }

      // pick lp token from balanceAssets
      const lpAssets = balanceAssets.filter((x:any) => {
        const found = _.find(data.pairs, { liquidity_asset_id: x.asset_id });
        if (found) {
          return true;
        }
        return false;
      })

      setAddAssets(merged);
      setRemoveAssets(lpAssets);
      setAddPairs(data.pairs);

      setLoading(false);
    }

    setLoading(true);
    refresh();
  }, []);

  useEffect(() => {
    if (selectedAddAsset1 && selectedAddAsset2) {
      // check the selected assets are existed or not
      for (let ix = 0; ix < addPairs.length; ix++) {
        const pair = addPairs[ix];
        if ((pair.base_asset_id === selectedAddAsset1.asset_id && pair.quote_asset_id === selectedAddAsset2.asset_id)
          ||
          (pair.base_asset_id === selectedAddAsset2.asset_id && pair.quote_asset_id === selectedAddAsset1.asset_id)) {
          setExistedPair(pair);
          return;
        }
        setExistedPair(null);
      }
    }
  } , [selectedAddAsset1, selectedAddAsset2]);

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
    const assetIds = await utils.swap.getAssets(pairsJson);

    const needToLoadIds = [];
    for (let ix = 0; ix < assetIds.length; ix++) {
      const aid = assetIds[ix];
      if (cacheCtx.getAsset(aid) === null) {
        needToLoadIds.push(aid);
      }
    }

    const promises = needToLoadIds.map(async (assetId:string) => {
      return await cacheCtx.loadAsset(assetId);
    });
    await Promise.all(promises);

    const assets = assetIds.map((assetId:string) => {
      return cacheCtx.getAsset(assetId)
    }).filter((a:any) => {
      return a !== null;
    })

    return {assets, assetIds, pairs: pairsJson}
  }

  const onTabItemClick = (item:any, index:number) => {
    console.log(item, index);
  }

  const validatedAdd = () => {
    if (existedPair !== null) {
      if (addAmount1 && addAmount2
        && new Decimal(selectedAddAsset1.balance).gte(addAmount1)
        && new Decimal(selectedAddAsset2.balance).gte(addAmount2)) {
        return true;
      }
    }
    return false;
  }

  const validatedRemove = () => {
    if (selectedRemoveAsset && removeAmount && new Decimal(selectedRemoveAsset.balance).gte(removeAmount)) {
      return true;
    }
    return false;
  }

  const changeAddAsset1 = (newValue:any) => {
    const addr = newValue.value;
    const found = _.find(addAssets, { asset_id: addr });
    if (found) {
      setSelectedAddAsset1(found);
      updateRelativeAmount(found, selectedAddAsset2, existedPair, addAmount1);
    }
  }

  const renderAddSelect1 = () => {
    const selectOptions = addAssets ? addAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedAddAsset1) {
      selectedOption = _.find(selectOptions, { value: selectedAddAsset1.asset_id });
    }
    return (
      <Select options={selectOptions}
        value={selectedOption}
        onChange={changeAddAsset1}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const changeAddAsset2 = (newValue:any) => {
    const addr = newValue.value;
    const found = _.find(addAssets, { asset_id: addr });
    if (found) {
      setSelectedAddAsset2(found);
      updateRelativeAmount(selectedAddAsset1, found, existedPair, addAmount1);
    }
  }

  const renderAddSelect2 = () => {
    const selectOptions = addAssets ? addAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedAddAsset2) {
      selectedOption = _.find(selectOptions, { value: selectedAddAsset2.asset_id });
    }
    return (
      <Select options={selectOptions}
        value={selectedOption}
        onChange={changeAddAsset2}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const changeAddAmount1 = (e:any) => {
    const newAmount1 = e.target.value;
    setAddAmount1(newAmount1);
    // update addAmount2
    updateRelativeAmount(selectedAddAsset1, selectedAddAsset2, existedPair, newAmount1);
  }

  const fillAddAmount1 = (e:any) => {
    if (selectedAddAsset1) {
      setAddAmount1(selectedAddAsset1.balance);
      updateRelativeAmount(selectedAddAsset1, selectedAddAsset2, existedPair, selectedAddAsset1.balance);
    } else {
      setAddAmount1('0');
    }
    return
  }

  const updateRelativeAmount = (asset1:any, asset2:any, pair:any, inputAmount:string) => {
    if (asset1 && asset2 && pair && inputAmount) {
      let reversed = false;
      let amount1 = pair.base_amount;
      let amount2 = pair.quote_amount;

      if (asset1.asset_id === pair.quote_asset_id) {
        amount1 = pair.quote_amount;
        amount2 = pair.base_amount;
        reversed = true;
      }
      // @TODO calculate relative amount: from asset2 to asset1
      const scale = calScale(asset1, asset2, amount1, amount2);
      if (scale) {
        const newAmount2 =
          new Decimal(inputAmount).times(scale).toDecimalPlaces(8, Decimal.ROUND_DOWN).toString()
        setAddAmount2(newAmount2);
        return;
      }
    }
    setAddAmount2('0');
  }

  const calScale = (asset1:any, asset2:any, amount1:string, amount2:string) => {
    let hasLiquidity = false;
    let hasPrice = false;
    let s = 0.0;
    if (amount1 && amount2) {
      hasLiquidity = +amount1 > 0 && +amount2 > 0;
    }
    if (asset1 && asset2) {
      hasPrice = +asset1.price_usd > 0 && +asset2.price_usd > 0;
    }
    if (hasLiquidity) {
      s = +amount2 / +amount1;
    } else if (hasPrice) {
      s = +asset1.price_usd / +asset2.price_usd;
    }
    return s;
  }

  const addLiquidity = async () => {
    setLoading(true);

    // generate 2 actions and send transactions
    const encryptedPINs = await utils.encrypt.generateEncryptedPINs(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id,
      2
    );
    const followId = uuid();

    try {
      await addSingleLiquidityAsset(encryptedPINs[0], selectedAddAsset1, selectedAddAsset2, addAmount1, followId);
    } catch (e) {
      console.log('add liquidity 1 error', e);
    }

    try {
      await addSingleLiquidityAsset(encryptedPINs[1], selectedAddAsset2, selectedAddAsset1, addAmount2, followId);
    } catch (e) {
      console.log('add liquidity 2 error', e);
    }

    setLoading(false);
    setShowAddLiquidityResultDialog(true);
  }

  const addSingleLiquidityAsset = async (encryptedPIN:string, asset:any, oppositeAsset:any, amount:string, followId:string) => {
    const timeout = 180; // 3 minutes
    const slippage = "0.001"; // 0.1%

    const traceId = uuid();

    const userId = user.user_id;

    const action = `1,${userId},${followId},${oppositeAsset.asset_id},${slippage},${timeout}`;

    const actionResp = await apiCtx.swapApi.action({
      action, amount: amount, asset_id: asset.asset_id, broker_id: '', trace_id: uuid()
    })
    const actionMemo = actionResp.data.action;

    const resp = await apiCtx.api.transactions({
      asset_id: asset.asset_id,
      amount: amount,
      trace_id: traceId,
      pin: encryptedPIN,
      memo: actionMemo,
      opponent_multisig: {
        receivers: cacheCtx.swapMtgInfo.members,
        threshold: cacheCtx.swapMtgInfo.threshold,
      }
    });

    return resp;
  }

  const changeRemoveAsset = (newValue:any) => {
    const addr = newValue.value;
    const found = _.find(removeAssets, { asset_id: addr });
    if (found) {
      setSelectedRemoveAsset(found);
    }
  }

  const renderRemoveSelect = () => {
    const selectOptions = removeAssets ? removeAssets.map((x:any) => {
      return { value: x.asset_id, label: x.symbol }
    }) : [];
    let selectedOption = null;
    if (selectedRemoveAsset) {
      selectedOption = _.find(selectOptions, { value: selectedRemoveAsset.asset_id });
    }
    return (
      <Select options={selectOptions}
        value={selectedOption}
        onChange={changeRemoveAsset}
        styles={customSelectStyles as any} classNamePrefix="react-select" />
    )
  }

  const onRemoveAmountChange = (e:any) => {
    setRemoveAmount(e.target.value);
  }

  const fillRemoveAmount = (e:any) => {
    if (selectedRemoveAsset) {
      setRemoveAmount(selectedRemoveAsset.balance);
    } else {
      setRemoveAmount('0');
    }
    return
  }

  const removeLiquidity = async () => {
    setLoading(true);

    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );
    const followId = uuid();

    const traceId = uuid();

    const userId = user.user_id;

    const action = `2,${userId},${followId}`;

    const actionResp = await apiCtx.swapApi.action({
      action, amount: removeAmount, asset_id: selectedRemoveAsset.asset_id, broker_id: '', trace_id: uuid()
    })
    const actionMemo = actionResp.data.action;

    const resp = await apiCtx.api.transactions({
      asset_id: selectedRemoveAsset.asset_id,
      amount: removeAmount,
      trace_id: traceId,
      pin: encryptedPIN,
      memo: actionMemo,
      opponent_multisig: {
        receivers: cacheCtx.swapMtgInfo.members,
        threshold: cacheCtx.swapMtgInfo.threshold,
      }
    });

    setLoading(false);
    setShowRemoveLiquidityResultDialog(true);

    return resp;
  }

  const createPool = () => {
    window.location.href = 'https://docs.pando.im/docs/lake/tutorials/listing';
  }

  tabItems[0].content = (
    <div className={styles.form}>

      <label>{ t('liquidity.add_asset_1') }</label>
      <div className={"row mb-2 "}>
        <div className="nes-select">
          { renderAddSelect1() }
        </div>
      </div>
      <div className={"row mb-2 "}>
        <input type="number" id="withdraw-amount" className="nes-input"
            value={addAmount1}
            onChange={changeAddAmount1}
        />
      </div>
      <div className="row" onClick={fillAddAmount1}>
        <div>{t('bal')} <span className="nes-text is-primary">{selectedAddAsset1?.balance || 0} {selectedAddAsset1?.symbol || ''}</span></div>
      </div>

      <label>{ t('liquidity.add_asset_2') }</label>
      <div className={"row mb-2 "}>
        <div className="nes-select">
          { renderAddSelect2() }
        </div>
      </div>
      <div className={"row mb-2 "}>
        <input type="number" id="withdraw-amount" className="nes-input"
          value={addAmount2}
          disabled readOnly
          onChange={(e:any) => {
            setAddAmount2(e.target.value);
          }}
        />
      </div>
      <div className="row">
        <div>{t('bal')} <span className="nes-text">{selectedAddAsset2?.balance || 0} {selectedAddAsset2?.symbol || ''}</span></div>
      </div>

      {
        existedPair === null && selectedAddAsset1 !== null && selectedAddAsset2 !== null?
        (
          <div>
            <div className="row">
              <button  className={"nes-btn block is-warning"}
                onClick={createPool}>{ t('liquidity.create_pool') }</button>
            </div>
            <div className="row nes-text">
              { t('hint.no_pool') }
            </div>
          </div>
        ): (
          <div >
            <div className="row">
              <button  className={"nes-btn block " + (validatedAdd() ? 'is-primary' : 'is-disabled')}
                disabled={!validatedAdd()} onClick={addLiquidity}>{ t('liquidity.add') }</button>
            </div>
            <div className="row nes-text">
              { t('hint.add_liquditiy_refunded') }
            </div>
          </div>
        )
      }

    </div>
  )

  tabItems[1].content = (
    <div className={styles.form}>
      <div className="row mb-2">
        <label>{ t('liquidity.remove_asset') }</label>
        <div className="nes-select">
          { renderRemoveSelect() }
        </div>
      </div>
      <div className="row mb-2">
        <label>{ t('liquidity.remove_asset_amount') }</label>
        <input type="number" id="deposit-amount" className="nes-input" value={removeAmount} onChange={onRemoveAmountChange}
        />
      </div>
      <div className="row" onClick={fillRemoveAmount}>
        <div>{t('bal')} <span className="nes-text is-primary">{selectedRemoveAsset?.balance || 0} {selectedRemoveAsset?.symbol || ''}</span></div>
      </div>
      <div className="row">
        <button  className={"nes-btn block " + (validatedRemove() ? 'is-primary' : 'is-disabled')}
          disabled={!validatedRemove()} onClick={removeLiquidity}>{ t('liquidity.remove') }</button>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <MetaHead title={ t('liquidity') } description="Liquidity management" />

      <main className="page-main">

        <Navbar />

        <div className="page-content">
          <Tabs items={tabItems} onClick={onTabItemClick} />
        </div>

        <AddLiquidityResultDialog
          show={showAddLiquidityResultDialog}
          onClose={() => setShowAddLiquidityResultDialog(false)}
          onHome={() => router.push('/') }
        />
        <RemoveLiquidityResultDialog
          show={showRemoveLiquidityResultDialog}
          onClose={() => setShowRemoveLiquidityResultDialog(false)}
          onHome={() => router.push('/') }
        />
      </main>

    </div>
  )
}

export default LiquidityManagementPage;
