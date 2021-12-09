import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';
import utils from '../../utils';

const SnapshotItemDialog = ({ show, item, onClose }: { show:boolean, item:any, onClose:any }) => {
  const { t } = useTranslation('common');

  const showHideClassName = show ? styles.show : styles.hide;

  return (
    <div className={['modal-mask', showHideClassName].join(' ')}>
      {item ?
        <section className={['nes-dialog', "modal-main"].join(' ')}>
          <h3 className={[styles.title, "mb-2"].join(' ')}>{t('snapshot')}</h3>
          <div className="mb-2">
            <div className={"nes-text " + styles.label}>{t('snapshot.amount')}</div>
            <div className="nes-text">{utils.fmt.amount(item.amount)}</div>
          </div>
          <div className="mb-2">
            <div className={"nes-text " + styles.label}>{t('snapshot.hash')}</div>
            <div className="nes-text">{item.transaction_hash}</div>
          </div>
          <div className="mb-2">
            <div className={"nes-text " + styles.label}>{t('snapshot.memo')}</div>
            <div className="nes-text">{item.memo || 'No memo'}</div>
          </div>
          <div className="mb-4">
            <div className={"nes-text " + styles.label}>{t('snapshot.time')}</div>
            <div className="nes-text">{item.created_at}</div>
          </div>
          <div className="row">
            <button className={["nes-btn is-primary ", styles.ok].join(' ')} onClick={onClose}>{t('close')}</button>
          </div>
        </section>
      : ''}
    </div>
  );
};

export default SnapshotItemDialog;