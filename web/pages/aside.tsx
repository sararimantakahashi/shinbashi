import { withRouter } from 'next/router'

import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';

import {IoMdWallet, IoMdSwap, IoMdWater} from 'react-icons/io';

import styles from '../styles/aside.module.scss';

import i18next from 'i18next';
import { useTranslation } from 'next-i18next';
import { useAuthContext } from '../context';
import { useEffect } from 'react';

const Aside = ({ router, toggled, handleToggleSidebar }:{router:any, toggled:any, handleToggleSidebar:any}) => {
  const { t } = useTranslation('common');

  const authContext = useAuthContext();
  const {
    connected, accountState
  } = authContext;

  const wallet = async () => {
    router.push({
      pathname: '/',
    });
    handleToggleSidebar();
  }

  const swap = async () => {
    router.push({
      pathname: '/swap',
    });
    handleToggleSidebar();
  }

  const liquidity = async () => {
    router.push({
      pathname: '/liquidity',
    });
    handleToggleSidebar();
  }

  const sideContent = (connected && accountState === 2 ?
    <Menu iconShape="square">
      <MenuItem icon={<IoMdWallet />} onClick={wallet}>{t('wallet')}</MenuItem>
      <MenuItem icon={<IoMdSwap />} onClick={swap}>{t('swap')}</MenuItem>
      <MenuItem icon={<IoMdWater/>} onClick={liquidity}>{t('liquidity')}</MenuItem>
    </Menu>: null)

  return (
    <ProSidebar
      toggled={toggled}
      breakPoint="md"
      onToggle={handleToggleSidebar}
    >
      <SidebarHeader>
        <div onClick={wallet}>
          <div className={styles.can}>
            <img className={styles.logo} src={'/logo.png'}/>
            <h1 className={styles.title} style={{
              marginTop: i18next.language.includes('en') ? '4px' : '-4px'
            }}>
              { t('site_name') }
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        { sideContent }
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly',
        }}>
          <a href="https://twitter.com/buidlShinbashi" target="_blank">
            <i className="nes-icon twitter"></i>
          </a>
          <a href="https://discord.gg/q5tMvYbksG" target="_blank">
            <i className="nes-icon discord"></i>
          </a>
          <a href="https://www.reddit.com/r/shinbashi/" target="_blank">
            <i className="nes-icon reddit"></i>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default withRouter(Aside);