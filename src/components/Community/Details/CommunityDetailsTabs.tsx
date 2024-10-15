'use client';

import React, { useState } from 'react';
import TabsRoot from '../../Tabs/TabsRoot';
import TabsHeader from '../../Tabs/TabsHeader';
import TabsContent from '../../Tabs/TabsContent';
import TabsList from '../../Tabs/TabsList';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCommunityPosts } from '@/aptos/view/community.view';
import { useAuth } from '@/context/auth.context';
import { CanViewProof } from '@/interfaces/community.interface';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { getChainId } from '@/aptos/view/getAccountAPTBalance';
import { useAccount } from '@/context/account.context';
import CommunityMainFeeds from './CommunityMainFeeds';

type Props = {
  address: string;
};
function CommunityDetailsTabs({ address }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { chainId } = useAccount();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'feeds'
  );

  const onTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`, { scroll: false });
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-5xl w-full mx-auto mt-5">
      <div className="overflow-scroll scrollbar-hide pb-40 lg:pb-10">
        <TabsRoot>
          <TabsList className="border-b border-light overflow-x-auto scrollbar-hide">
            <TabsHeader
              title="Feeds"
              value="feeds"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="About"
              value="about"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Members"
              value="members"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
          </TabsList>
          <TabsContent value="feeds" activeTabId={activeTab}>
            <div>
              <CommunityMainFeeds address={address} />
            </div>
          </TabsContent>
          <TabsContent value="about" activeTabId={activeTab}>
            <div></div>
          </TabsContent>
          <TabsContent value="members" activeTabId={activeTab}>
            <div></div>
          </TabsContent>
        </TabsRoot>
      </div>
    </div>
  );
}

export default CommunityDetailsTabs;
