'use client';

import React, { useState } from 'react';
import TabsContent from '../Tabs/TabsContent';
import TabsHeader from '../Tabs/TabsHeader';
import TabsList from '../Tabs/TabsList';
import TabsRoot from '../Tabs/TabsRoot';
import NFTs from './NFTs/NFTs';
import ListTransactions from './Transactions/ListTransactions';
import ListAssets from './Assets/ListAssets';

type Props = {
  className?: string;
};
export default function WalletTabs({ className }: Props) {
  const [activeTab, setActiveTab] = useState('tab1');

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="pt-5 pb-20">
      <TabsRoot>
        <TabsList className="px-0">
          <TabsHeader
            isActiveText={true}
            title="My Assets"
            value="tab1"
            activeTabId={activeTab}
            onTabChange={onTabChange}
            isCenter={false}
            //isActiveBg={true}
          />
          <TabsHeader
            isActiveText={true}
            title="NFTs"
            value="tab2"
            activeTabId={activeTab}
            onTabChange={onTabChange}
            isCenter={false}
            //isActiveBg={true}
          />
          <TabsHeader
            isActiveText={true}
            title="Transactions"
            value="tab3"
            activeTabId={activeTab}
            onTabChange={onTabChange}
            isCenter={false}
            //isActiveBg={true}
          />
        </TabsList>
        <TabsContent value="tab1" activeTabId={activeTab}>
          <div className="flex-1 mt-1 px-3">
            <ListAssets />
          </div>
        </TabsContent>
        <TabsContent value="tab2" activeTabId={activeTab}>
          <div className="flex-1 mt-1 px-3">
            <NFTs />
          </div>
        </TabsContent>
        <TabsContent value="tab3" activeTabId={activeTab}>
          <div className="flex-1 mt-1 px-3">
            <ListTransactions />
          </div>
        </TabsContent>
      </TabsRoot>
    </div>
  );
}
