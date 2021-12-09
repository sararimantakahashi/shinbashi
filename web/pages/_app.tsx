import '../styles/globals.scss'
import dynamic from "next/dynamic";
import type { AppProps } from 'next/app';
import { I18nextProvider } from 'react-i18next';
import i18n from "../locales/i18n";

import { AppProvider, AuthProvider, CacheProvider, ApiProvider } from '../context'; // import based on where you put it
import Layout from './layout';


function MyApp({ Component, pageProps }: AppProps) {

  const content = <Component {...pageProps} />;
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ApiProvider>
          <CacheProvider>
            <AppProvider>
              <Layout content={content}></Layout>
            </AppProvider>
          </CacheProvider>
        </ApiProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

// disable ssr for all pages
export default (dynamic(() => Promise.resolve(
  MyApp),
  {
    ssr: false,
  }
));

