import Decimal from 'decimal.js'
import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const Summary = ({ balance } : { balance:string }) => {
  const { t } = useTranslation('common');

  const balanceDisplay = new Decimal(balance).toFixed(2);
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.label}>{ t('summary.bal_label') }</div>
        <div className={styles.balance}>${balanceDisplay}</div>
      </div>
    </div>
  );
};

export default Summary;