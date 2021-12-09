import { withRouter } from 'next/router'
import { useTranslation } from 'next-i18next';

import styles from './index.module.scss';

const FuncOps = ({ router }: { router:any }) => {
  const { t } = useTranslation('common');

  const swap = async () => {
    router.push({
      pathname: '/swap',
    });
  }

  const liquidity = async () => {
    router.push({
      pathname: '/liquidity',
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <button className="nes-btn btn" onClick={swap}>{t('swap')}</button>
        <button className="nes-btn btn" onClick={liquidity}>{t('liquidity')}</button>
        <button className="nes-btn btn is-disabled" disabled onClick={swap}>{t('mint')}</button>
      </div>
    </div>
  );
};

export default withRouter(FuncOps);