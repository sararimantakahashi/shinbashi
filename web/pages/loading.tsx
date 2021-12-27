import { withRouter } from 'next/router'
import i18next from 'i18next';
import { useTranslation } from 'next-i18next';
import { useAppContext } from '../context';
import { useEffect, useState } from 'react';

const Loading = ({ router }:{router:any}) => {
  const { t } = useTranslation('common');

  const appCtx = useAppContext();

  const [showHideClassName, setShowHideClassName ] = useState<string>('loading-hide');

  useEffect(() => {
    if (appCtx.loading) {
      setShowHideClassName('loading-show');
    } else {
      setShowHideClassName('loading-hide');
    }
  }, [appCtx.loading]);


  return (
    <div className={['loading-mask', showHideClassName].join(' ')}>
      <section className='loading-main'>
        <div className="loading-content">
          <img className="loading-icon" src={'/loading.gif'}/>
          <span>{t("loading")}</span>
        </div>
      </section>
    </div>
  );
};

export default withRouter(Loading);