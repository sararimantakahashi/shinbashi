import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const SwapResultDialog = ({ show, result, onClose, onHome }: { show:boolean, result:any, onClose:any, onHome:any }) => {
  const { t } = useTranslation('common');

  const showHideClassName = show ? styles.show : styles.hide;
  const line1 = t('hint.swap_result_1');
  const line2 = t('hint.swap_result_2');
  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      <section className={['nes-dialog', styles.main].join(' ')}>
        <h3 className={styles.title}>{t('result')}</h3>
        <div className="mb-4">
          <div className="nes-text">{result?.state || line1}</div>
          <div className="nes-text">{line2}</div>
        </div>
        <div className="row">
          <button className={["nes-btn is-primary ", styles.ok].join(' ')} onClick={onClose}>{t('ok')}</button>
          <button className={["nes-btn ", styles.ok].join(' ')} onClick={onHome}>{t('home')}</button>
        </div>
      </section>
    </div>
  );
};

export default SwapResultDialog;