import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const AddrOptionDialog = ({ show, addr, onChoose, onDelete }: { show:boolean, addr:any, onChoose:any, onDelete:any }) => {
  const { t } = useTranslation('common');

  const showHideClassName = show ? styles.show : styles.hide;

  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      <section className={['nes-dialog', styles.main].join(' ')}>
        <h3 className={styles.title}>{t('address')}</h3>
        <div className="mb-4">
          <div className="nes-text is-primary mb-2">{addr.label}</div>
          <div className="nes-text">{addr.destination}</div>
        </div>
        <div className="row">
          <button className={["nes-btn ", styles.wallet].join(' ')} onClick={onChoose}>{t('address.choose')}</button>
        </div>
        <div className="row">
          <button className={["nes-btn is-error ", styles.wallet].join(' ')} onClick={onDelete}>{t('address.delete')}</button>
        </div>
      </section>
    </div>
  );
};

export default AddrOptionDialog;