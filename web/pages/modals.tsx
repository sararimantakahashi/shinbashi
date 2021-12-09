import { withRouter } from 'next/router'
import i18next from 'i18next';
import { useTranslation } from 'next-i18next';
import { useApiContext } from '../context';
import { useEffect, useState } from 'react';

const Modals = ({ router }:{router:any}) => {
  const { t } = useTranslation('common');

  const apiCtx = useApiContext();

  const [showHideClassName, setShowHideClassName ] = useState<string>('modal-hide');
   apiCtx.errno !== 0 ? 'modal-show' : 'modal-hide';

  useEffect(() => {
    if (apiCtx.errno === 0) {
      setShowHideClassName('modal-hide');
    } else {
      setShowHideClassName('modal-show');
    }
  }, [apiCtx.errno]);

  const onClose = () => {
    apiCtx.clearError();
    setShowHideClassName('modal-hide');
  }

  return (
    <div className={['modal-mask', showHideClassName, 'error-modal'].join(' ')}>
      <section className={['nes-dialog modal-main'].join(' ')}>
        <h3 className='modal-title'>{t('error')}</h3>
        <div className="mb-4">
          <div>
            <p className="nes-text">{t('error.code')}</p>
            <p className="nes-text is-error">{apiCtx.errno}</p>
          </div>
          <div className="nes-text">
            <p className="nes-text">{t('error.message')}</p>
            <p className="nes-text is-error">{apiCtx.errmsg}</p>
          </div>
        </div>
        <div className="row">
          <button className={["nes-btn is-primary modal-ok"].join(' ')} onClick={onClose}>{t('ok')}</button>
        </div>
      </section>
    </div>
  );
};

export default withRouter(Modals);