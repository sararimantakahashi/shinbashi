
import styles from './index.module.scss';

const AssetIcon = ({ icon, chain_icon } : {  icon: string, chain_icon: string }) => {
  return (
    <div className={styles.wrapper}>
      <img className={"nes-avatar is-rounded " + styles.icon} src={icon}></img>
      {
        chain_icon && chain_icon !== icon?
          <img className={"nes-avatar is-rounded " + styles.chain_icon} src={chain_icon}></img>
          : ''
      }
    </div>
  );
};

export default AssetIcon;
