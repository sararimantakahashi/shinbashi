import AssetIcon from '../AssetIcon';
import { useAppContext, useCacheContext } from '../../context';
import Decimal from 'decimal.js'
import styles from './index.module.scss';

const AssetCard = ({ asset } : { asset:any }) => {
  const {
    getAsset
  } = useCacheContext();

  if (asset) {
    const chainAsset:any = getAsset(asset.chain_id);
    const chainIcon = chainAsset ? chainAsset.icon_url : null;
    const valueUsd = new Decimal(asset.price_usd).times(asset.balance).toFixed(2);

    return (
      <div className={styles.card}>
        <div className={styles.icon_wrapper}>
          <AssetIcon icon={asset.icon_url} chain_icon={chainIcon}/>
        </div>
        <div className={styles.content}>
          <div className={styles.balance}>{asset.balance} {asset.symbol}</div>
          <div className={styles.fiat}>${valueUsd}</div>
        </div>

      </div>
    );
  }
  return (
    <div />
  );
};

export default AssetCard;