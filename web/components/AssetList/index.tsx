import Decimal from 'decimal.js';
import { useTranslation } from 'next-i18next';

import styles from './index.module.scss';
import AssetItem from '../AssetItem';
import utils from '../../utils';
import { useAppContext, useCacheContext } from '../../context';

const AssetList = ({ assets } : { assets:any }) => {
  const { t } = useTranslation('common');

  const {
    getAsset
  } = useCacheContext();

  const sorted = utils.tools.filteredAssets(assets);

  const items = sorted.map((asset:any, ix:number) => {
    const amount = new Decimal(asset.amount || asset.balance);
    const totalAmount = utils.fmt.amount(amount.toString(), 8, false);
    const totalValue = utils.fmt.fiat(amount.mul(asset.price_usd));
    const title = `${totalAmount} ${asset.symbol}`;
    const subtitle = `${totalValue}`;
    const chainAsset:any = getAsset(asset.chain_id);
    const chainIcon = chainAsset ? chainAsset.icon_url : null;
    return <AssetItem key={ix} assetId={asset.asset_id} icon={asset.icon_url} chain_icon={chainIcon} title={title} subtitle={subtitle} />
  });

  const renderContent = items && items.length ?
  (
    <div className={"nes-container with-title is-centered " + styles.ul}>
      <p className="title">{t('assets')}</p>
      {items}
    </div>
  )
  :
  (
    <div className={styles.empty_hint}>{t('hint.no_asset')}</div>
  )

  return (
    <div className={styles.grid}>
      {renderContent}
  </div>
  );
};

export default AssetList;