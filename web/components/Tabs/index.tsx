import { useState } from 'react';
import styles from './index.module.scss';

const Tabs = ({items, onClick}: {items:Array<any>, onClick:any}) => {

  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (item:any, index: number) => {
    setActiveTab(index);
    onClick(item, index);
  }

  const tabButtons = items.map((item:any, index:number) => {
    return (
        <label className={styles.tab_item +  ' ' + (activeTab === index ? styles.active : styles.inactive)}
          key={index}
          onClick={() => handleClick(item, index) }>
          <input type="radio" className={"nes-radio"} name="answer" defaultChecked={index === 0} />
          <span>{item.label}</span>
        </label>
    )
  });

  return (
    <div className={styles.tabs}>
      <div className={styles.tab_buttons}>
        {tabButtons}
      </div>
      <div className={styles.tab_contents}>
        {items[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;