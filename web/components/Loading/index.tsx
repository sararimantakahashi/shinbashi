import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const Loading = ({loading, title="Loading"}:{loading:boolean, title?:string}) => {
  const { t } = useTranslation('common');
  if (title.trim() === '') {
    title = t('loading')
  }
  return (
    <div className={styles.loading_wrapper + ' ' + (loading ? styles.show : '')}>
      <div className={styles.loading}>
        <strong className="nes-text">{title}</strong>
      </div>
    </div>
  );
};

export default Loading;