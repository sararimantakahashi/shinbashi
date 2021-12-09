import styles from './index.module.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import SnapshotItem from '../SnapshotItem';
import SnapshotItemDialog from '../SnapshotItemDialog';

const SnapshotList = ({ snapshots } : { snapshots:any }) => {
  const { t } = useTranslation('common');

  const [showSnapshotItemDialog, setShowSnapshotItemDialog] = useState<boolean>(false);
  const [currentSnapshotItem, setCurrentSnapshotItem] = useState<any>(null);

  const items = snapshots.map((snapshot:any, ix:number) => {
    return <SnapshotItem key={ix} snapshot={snapshot} />
  });

  const groups:any = {};

  for (let ix = 0; ix < snapshots.length; ix++) {
    const item = snapshots[ix];
    const date = item.created_at.split('T')[0];
    if (date in groups) {
      groups[date].items.push(item);
    } else {
      groups[date] = {
        date,
        items: [item]
      };
    }
  }

  const groupItems = Object.keys(groups).map((key:string) => {
    return groups[key];
  });

  groupItems.sort((a:any, b:any) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });

  const clickItem = (item:any) => {
    setCurrentSnapshotItem(item)
    setShowSnapshotItemDialog(true);
  }

  const content = groupItems.map((group:any, ix:number) => {
    return (
      <div key={ix} className={styles.group}>
        <div className={"nes-text is-primary " + styles.group_date}>{group.date}</div>
        <div className={styles.group_items}>
          {group.items.map((item:any, iy:number) => {
            return <SnapshotItem key={iy} snapshot={item} onClick={() => clickItem(item)}/>
          })}
        </div>
      </div>
    );
  });

  const renderContent = items && items.length ?
  (
    <div className={"nes-container with-title is-centered " + styles.ul}>
      <p className="title">{t('snapshots')}</p>
      {content}
    </div>
  )
  :
  (
    <div className={styles.empty_hint}>{t('hint.no_snapshot')}</div>
  )

  return (
    <div className={styles.grid}>
      {renderContent}
      <SnapshotItemDialog
        show={showSnapshotItemDialog}
        item={currentSnapshotItem}
        onClose={() => setShowSnapshotItemDialog(false)}
      />
    </div>
  );
};

export default SnapshotList;