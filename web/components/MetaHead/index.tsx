import Head from 'next/head';
import { useTranslation } from 'next-i18next';

const MetaHead = ({title="", description=""}) => {
  const { t } = useTranslation('common');

  if (description === '') {
    description = t("site_description")
  }
  if (title) {
    title = `Shinbashi - ${title}`;
  } else {
    title = `Shinbashi - ${description}`;
  }
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/logo.png" />
    </Head>
  );
};

export default MetaHead;