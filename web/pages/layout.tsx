import dynamic from "next/dynamic";
import type { AppProps } from 'next/app';

import Aside from './aside';
import Modals from './modals';
import styles from '../styles/layout.module.scss';

import { useAppContext } from '../context';

const Layout = ({content}:{content:any}) => {

  const {
    sidebarOpen, setSidebarOpen
  } = useAppContext()

  const handleToggleSidebar = (value:any) => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.app}>
      <Aside toggled={sidebarOpen} handleToggleSidebar={handleToggleSidebar}/>
      {content}
      <Modals />
    </div>
  )
}

export default Layout;

