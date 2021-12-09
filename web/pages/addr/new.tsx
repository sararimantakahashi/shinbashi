import { useRouter, withRouter } from 'next/router'
import styles from './index.module.scss'

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import { MetaHead, Navbar, Loading } from '../../components';
import { getAPI } from '../../api';
import { useApiContext, useAuthContext } from '../../context';
import utils from '../../utils'

const AddrIndex = ({ router }: { router:any }) => {
  const { t } = useTranslation('common');

  const {
    accountId,
    user,
    keypair,
  } = useAuthContext();

  const apiCtx = useApiContext();

  const [label, setLabel] = useState<any>('');
  const [destination, setDestination] = useState<any>('');
  const [tag, setTag] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);

  const assetId = router.query.asset as string

  const web3 = utils.getWeb3();

  const onLabelChange = (e:any) => {
    setLabel(e.target.value);
  }

  const onDestinationChange = (e:any) => {
    setDestination(e.target.value);
  }

  const onTagChange = (e:any) => {
    setTag(e.target.value);
  }

  const create = async () => {
    setLoading(true);

    const encryptedPIN = await utils.encrypt.generateEncryptedPIN(
      web3,
      accountId,
      keypair.privateKey,
      user.pin_token_base64,
      user.session_id
    );

    await apiCtx.api.createAddress(assetId, destination, tag, label, encryptedPIN);

    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/addr',
        query: {
          asset: assetId,
        }
      });
    }, 100)
  }

  return (
    <div className="page-container">
      <MetaHead title="Addresses"></MetaHead>

      <main className="page-main">
        <Loading loading={loading}/>

        <Navbar />
        <div className="page-content">

          <div className={styles.hint}>
            { t('address.new') }
          </div>

          <div className={styles.form}>

            <div className="row">
              <label htmlFor="label-input">
                { t('address.label') }
              </label>
              <input id="label-input" className="nes-input block"
                value={label} placeholder={t('address.entry_label')} onChange={onLabelChange}
              />
            </div>

            <div className="row">
              <label htmlFor="destination-input">{t('address')}</label>
              <textarea id="destination-input" className="nes-input block"
                value={destination} placeholder={t('address.entry_address')} onChange={onDestinationChange}
              />
            </div>

            <div className="row">
              <label htmlFor="destination-input">{t('address.tag')}</label>
              <textarea id="destination-input" className="nes-input block"
                value={tag} placeholder={t('address.entry_tag')} onChange={onTagChange}
              />
            </div>

            <div className="row">
              <button className="nes-btn is-primary block" onClick={create}>{t('create')}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default withRouter(AddrIndex);
