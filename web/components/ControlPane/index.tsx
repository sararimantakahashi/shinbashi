import { withRouter } from 'next/router'
import { useState } from 'react';

import {
  WalletOps, FuncOps
} from '../index';

import { useAppContext, useAuthContext } from '../../context';

const ControlPane = ({ router, web3 }: { router:any, web3:any }) => {
  const authContext = useAuthContext();
  const {
    accountId,
  } = authContext;

  const {
    ethAddress,
  } = useAppContext();

  return (
    <div>
      <WalletOps accountId={accountId} ethAddress={ethAddress}/>
    </div>
  );
};

export default withRouter(ControlPane);