import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';
import router from 'next/router';

const WithdrawResultDialog = ({ show, asset, amount, address, onClose }: { show:boolean, asset:any, amount:string, address:any, onClose:any }) => {
  const { t } = useTranslation('common');

  const onCheck = () => {
    router.push(
      `/assets/${asset.asset_id}`
    )
  }

  const showHideClassName = show ? styles.show : styles.hide;
  const line = t('hint.withdraw_result');
  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      <section className={['nes-dialog', styles.main].join(' ')}>
        <h3 className={styles.title}>{t('result')}</h3>
        <div className="mb-4">
          <div className="nes-text">{line}</div>
        </div>
        <div className="row">
          <button className={["nes-btn is-primary ", styles.ok].join(' ')} onClick={onClose}>{t('ok')}</button>
          <button className={["nes-btn ", styles.ok].join(' ')} onClick={onCheck}>{t('balance')}</button>
        </div>
      </section>
    </div>
  );
};

export default WithdrawResultDialog;