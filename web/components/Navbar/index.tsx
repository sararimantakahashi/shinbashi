import styles from './index.module.scss';

import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useAppContext, useAuthContext, useCacheContext } from '../../context';
import { FaHeart, FaBars } from 'react-icons/fa';

const Navbar = ({}) => {
  const { t } = useTranslation('common');
  const {
    sidebarOpen, setSidebarOpen,
  } = useAppContext();

  const handleToggleSidebar = function () {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className={styles.nav}>
      <div className={styles.toggle_btn_wrapper} >
        <button className="nes-btn" onClick={() => handleToggleSidebar()}>
          <FaBars />
        </button>
      </div>
      <Link href="/">
        <div className={styles.can}>
          <img className={styles.logo} src={'/logo.png'}/>
        </div>
      </Link>
    </div>
  );
};

export default Navbar;