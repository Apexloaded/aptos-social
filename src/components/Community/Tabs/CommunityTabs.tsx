'use client';

import React, { useState } from 'react';
import TabsRoot from '../../Tabs/TabsRoot';
import TabsHeader from '../../Tabs/TabsHeader';
import TabsContent from '../../Tabs/TabsContent';
import TabsList from '../../Tabs/TabsList';
import CommunityFeeds from './CommunityFeeds';
import ExploreCommunity from './ExploreCommunity';
import JoinedCommunity from './JoinedCommunity';
import OwnedCommunity from './OwnedCommunity';
import { useRouter, useSearchParams } from 'next/navigation';

function CommunityTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'posts'
  );

  const onTabChange = (tabId: string) => {
    router.push(`?tab=${tabId}`, { scroll: false });
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-5xl w-full mx-auto">
      <div className="overflow-scroll scrollbar-hide pb-40 lg:pb-10">
        <TabsRoot>
          <TabsList className="border-b border-light overflow-x-auto scrollbar-hide">
            <TabsHeader
              title="Posts"
              value="posts"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Explore"
              value="explore"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Joined"
              value="joined"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Owned"
              value="owned"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
          </TabsList>
          <TabsContent value="posts" activeTabId={activeTab}>
            <CommunityFeeds />
          </TabsContent>
          <TabsContent value="explore" activeTabId={activeTab}>
            <ExploreCommunity />
          </TabsContent>
          <TabsContent value="joined" activeTabId={activeTab}>
            <JoinedCommunity />
          </TabsContent>
          <TabsContent value="owned" activeTabId={activeTab}>
            <OwnedCommunity />
          </TabsContent>
        </TabsRoot>
      </div>
    </div>
  );
}

export default CommunityTabs;
