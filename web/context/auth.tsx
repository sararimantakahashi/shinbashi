import { createContext, useContext, useState } from 'react';
import useSessionStorage from '../hooks/useSessionStorage';

type Props = {
  children: any;
};

type Keypair = {
  publicKey: string;
  privateKey: string;
};

type authContextType = {
  accountId: string;
  setAccountId: (val:any) => void;

  keypair: Keypair;
  setKeypair: (val:any) => void;
  getKeypair: () => any;

  user: any;
  setUser: (val:any) => void;
  getUser: () => any;

  // 0 -> not created / register yet
  // 1 -> registered but has no pin
  // 2 -> has pin, normal state
  // 3 -> error pin.
  accountState: number;
  setAccountState: (val:any) => void;

  connected: boolean;
  setConnected: (val:any) => void;
};

const contextDefaultValues: authContextType = {
  accountId: "",
  setAccountId: () => {},

  keypair: { publicKey: "", privateKey: "" },
  setKeypair: () => {},
  getKeypair: () => {},

  user: {},
  setUser: () => {},
  getUser: () => {},

  accountState: 0,
  setAccountState: () => {},

  connected: false,
  setConnected: () => {},
};

const AuthContext = createContext(contextDefaultValues);

export function AuthProvider({ children }:Props) {

  const [accountId, setAccountId] = useSessionStorage('__account_id__', ''); // useState<string>('');
  const [keypair, setKeypair] = useState<Keypair>(contextDefaultValues.keypair);
  const [user, setUser] = useState(null);
  const [accountState, setAccountState] = useState(0);
  const [connected, setConnected] = useState(false);

  const getUser = () => {
    return user;
  }

  const getKeypair = () => {
    return user;
  }

  const sharedState = {
    accountId, setAccountId,
    keypair, setKeypair, getKeypair,
    user, setUser, getUser,
    accountState, setAccountState,
    connected, setConnected
  }

  return (
    <AuthContext.Provider value={sharedState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}