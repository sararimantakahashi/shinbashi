import styles from './index.module.scss';
import { useTranslation } from 'next-i18next';

const Intro = ({ }) => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.intro}>
      <div className={styles.text}>
        <strong className="nes-text is-primary">
          { t('site_description.part1') }
        </strong>
        <span className={styles.text}>
          { t('site_description.part2') }
        </span>
        </div>
    </div>
  );
};

export default Intro;