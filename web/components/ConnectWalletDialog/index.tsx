import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

const ConnectWalletDialog = ({ show, onClose, onConnect }: { show:boolean, onClose:any, onConnect:any }) => {
  const { t } = useTranslation('common');

  const [loading, setLoading] = useState(false);

  const showHideClassName = show ? styles.show : styles.hide;

  const wallets = [
    { id: 'metamask', name: t('metamask'), cls: 'is-error' },
    // @TODO support other wallets
    // { id: 'wallet_connect', name: 'Wallet Connect', cls: 'is-primary' },
  ]

  const walletItems = wallets.map((w, ix) =>  {
    return (
      <button key={ix} className={['nes-btn', styles.wallet, (loading ? 'is-disabled' : w.cls)].join(' ')}
        disabled={loading}
        onClick={() => {
          setLoading(true);
          return onConnect(w.id)
        }}>{ loading ?  t('loading'): w.name}</button>
    )
  });

  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      <section className={['nes-dialog', styles.main].join(' ')}>
        <h3 className={styles.title}>{t('connect_wallet')}</h3>
        <p>
          {walletItems}
          <button className={["nes-btn", styles.wallet].join(' ')} onClick={onClose}>{t('cancel')}</button>
        </p>
      </section>
    </div>
  );
};

export default ConnectWalletDialog;