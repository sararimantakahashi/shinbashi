import { useRouter, withRouter } from 'next/router'
import utils from '../../utils';
import { useAppContext, useCacheContext } from '../../context';

import styles from './index.module.scss';

const SnapshotItem = ({ router, snapshot, onClick } : { router:any, snapshot:any, onClick?:any }) => {

  const {
    getAsset
  } = useCacheContext();

  const amount = utils.fmt.amount(snapshot.amount || snapshot.balance)
  const asset:any = getAsset(snapshot.asset_id);
  const title = `${amount} ${asset?.symbol || ''}`;
  return (
    <div className={styles.item} onClick={() => onClick ? onClick() : ''}>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
      </div>
    </div>
  );
};

export default withRouter(SnapshotItem);