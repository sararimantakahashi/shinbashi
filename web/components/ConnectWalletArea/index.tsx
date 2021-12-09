import styles from './index.module.scss';
import utils from '../../utils';
import { useTranslation } from 'next-i18next';

const ConnectWalletArea = ({ onConnect }:{ onConnect:any }) => {
  const { t } = useTranslation('common');

  const onDownload = () => {
    // download metamask
    window.open('https://metamask.io/', '_blank');
  }

  const renderConnectArea = utils.detectSupportWallets() ?
  (
    <div className={styles.connect_wallet_area}>
      <button className="nes-btn is-primary" onClick={onConnect}>{ t('connect_wallet') }</button>
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