import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const AddLiquidityResultDialog = ({ show, onClose, onHome }: { show:boolean, onClose:any, onHome:any }) => {
  const { t } = useTranslation('common');

  const showHideClassName = show ? styles.show : styles.hide;
  const line = t('hint.add_liquditiy_result');
  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      <section className={['nes-dialog', styles.main].join(' ')}>
        <h3 className={styles.title}>{t('result')}</h3>
        <div className="mb-4">
          <div className="nes-text">{line}</div>
        </div>
        <div className="row">
          <button className={["nes-btn is-primary ", styles.ok].join(' ')} onClick={onClose}>{t('ok')}</button>
          <button className={["nes-btn ", styles.ok].join(' ')} onClick={onHome}>{t('home')}</button>
        </div>
      </section>
    </div>
  );
};

export default AddLiquidityResultDialog;