import { useRouter, withRouter } from 'next/router'
import AssetIcon from '../AssetIcon';

import styles from './index.module.scss';

const AssetItem = ({ router, assetId, icon, chain_icon, title, subtitle } : { router:any, assetId:string, icon: string, chain_icon: string, title: string, subtitle: string }) => {
  const handleClick = () => {
    router.push('/assets/' + assetId)
  }

  return (
    <div className={styles.item} onClick={handleClick}>
      <div className={styles.icon_wrapper}>
        <AssetIcon icon={icon} chain_icon={chain_icon}/>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
};

export default withRouter(AssetItem);