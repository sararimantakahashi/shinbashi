import styles from './index.module.scss';
import utils from '../../utils';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

const ConnectWalletArea = ({ onConnect, onUnlock }:{ onConnect:any, onUnlock:any }) => {
  const { t } = useTranslation('common');

  const [locked, setLocked] = useState(true);

  const onDownload = () => {
    // download metamask
    window.open('https://metamask.io/', '_blank');
  }

  const checkUnlockedStatus = (web3:any) => {
    web3.eth.getAccounts().then((accs:any)=> {
      if (accs.length > 0) {
        setLocked(false);
      } else {
        setTimeout(() => checkUnlockedStatus(web3), 1000)
      }
    });
  }

  useEffect(() => {
    const web3 = utils.getWeb3();
    if (web3) {
      checkUnlockedStatus(web3);
    }
  } , [])


  const renderConnectArea = utils.detectSupportWallets() ?
  (
    <div className={styles.connect_wallet_area}>
      {locked ?
        <button className="nes-btn is-primary" onClick={onUnlock}>{ t('unlock_wallet') }</button>
      :
        <button className="nes-btn is-primary" onClick={onConnect}>{ t('connect_wallet') }</button>
      }
    </div>
  ) :
  (
    <div className={styles.connect_wallet_area}>
      <div className={styles.download_hint}>{ t('connect_wallet.no_wallet_hint') }</div>
      <button className="nes-btn is-success" onClick={onDownload}>{ t('connect_wallet.download') }</button>
    </div>
  )
  return (
    <div>
      {renderConnectArea}
    </div>
  );
};

export default ConnectWalletArea;