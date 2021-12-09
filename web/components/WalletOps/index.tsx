import { useRouter, withRouter } from 'next/router'
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

import styles from './index.module.scss';

const WalletOps = ({ router, accountId, ethAddress }: { router:any, accountId: string, ethAddress: string }) => {
  const { t } = useTranslation('common');

  const deposit = async () => {
    router.push({
      pathname: '/deposit',
      query: { from: accountId, target: ethAddress },
    });
  }

  const withdraw = async () => {
    router.push({
      pathname: '/withdraw',
    });
  }



  return (
    <div className={styles.grid}>
      <button className="nes-btn btn is-primary" onClick={deposit}>{t('deposit')}</button>
      <button className="nes-btn btn" onClick={withdraw}>{t('withdraw')}</button>
    </div>
  );
};

export default withRouter(WalletOps);