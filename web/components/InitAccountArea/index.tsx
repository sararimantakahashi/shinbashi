import React, { useState } from 'react';

import styles from './index.module.scss';

import { useTranslation } from 'next-i18next';

const InitAccountArea = ({ onInitialize }: { onInitialize: any }) => {

  const { t } = useTranslation('common');

  const [name, setName] = useState('');
  const [validated, setValidated] = useState(false);

  const handleClick = () => {
    onInitialize(name);
  }

  const handleChange = (e:any) => {
    const val = e.target.value.trim();
    if (val) {
      setValidated(true);
    } else {
      setValidated(false);
    }
    return setName(e.target.value);
  }

  return (
    <div className={styles.area}>
      <div className={styles.hint}>{ t('initialize_account') }</div>
      <input className={"nes-input " + styles.input} placeholder="wallet name" value={name} onChange={handleChange} />
      <button className={"nes-btn " + (validated ? "is-success" : "is-disabled")} disabled={!validated} onClick={handleClick}>{ t('initialize_account') }</button>
    </div>
  );
};

export default InitAccountArea;
