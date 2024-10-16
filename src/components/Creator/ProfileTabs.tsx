'use client';

import React, { useState, useEffect } from 'react';
import TabsRoot from '../Tabs/TabsRoot';
import TabsHeader from '../Tabs/TabsHeader';
import TabsContent from '../Tabs/TabsContent';
import TabsList from '../Tabs/TabsList';
import { IPostItem } from '@/interfaces/feed.interface';
import { useAuth } from '@/context/auth.context';
import { useQuery } from '@tanstack/react-query';
import { getOwnedPosts } from '@/aptos/view/feeds.view';
import { sortPostByDate } from '@/lib/posts';
import UserFeeds from './Tabs/RepliesTab';
import Collected from './Tabs/CollectedTab';
import EmptyBox from '../EmptyBox';
import { useAccount } from '@/context/account.context';
import { UserInterface } from '@/interfaces/user.interface';
import { useRouter, useSearchParams } from 'next/navigation';
import CollectibleTab from './Tabs/CollectibleTab';
import CollectedTab from './Tabs/CollectedTab';
import RepliesTab from './Tabs/RepliesTab';

type Props = {
  username: string;
};
function ProfileTabs({ username }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'collectibles'
  );

  const [user, setUser] = useState<UserInterface>();
  const { user: authUser, findCreator } = useAuth();
  const { data: userData } = findCreator(username);

  useEffect(() => {
    if (userData) {
      const { created_at, ...payload } = userData;
      const date = new Date(Number(created_at) * 1000).toISOString();
      setUser({ ...payload, created_at: date });
    }
  }, [userData]);

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
              title="Collectibles"
              value="collectibles"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Collected"
              value="collected"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Replies"
              value="replies"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Community"
              value="community"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            {authUser?.username == username && (
              <TabsHeader
                title="Tips"
                value="tips"
                activeTabId={activeTab}
                onTabChange={onTabChange}
              />
            )}
          </TabsList>
          <TabsContent value="collectibles" activeTabId={activeTab}>
            <CollectibleTab username={username} user={user} />
          </TabsContent>
          <TabsContent value="collected" activeTabId={activeTab}>
            <CollectedTab username={username} user={user} />
          </TabsContent>
          <TabsContent value="replies" activeTabId={activeTab}>
            <RepliesTab username={username} user={user} />
          </TabsContent>
          <TabsContent value="community" activeTabId={activeTab}>
            <div>
              <div className="text-center py-20">
                <EmptyBox
                  title="No communities"
                  message={`${username} do not have any active community`}
                />
              </div>
            </div>
          </TabsContent>

          {authUser?.username == username && (
            <TabsContent value="tips" activeTabId={activeTab}>
              <div>
                <div className="text-center py-20">
                  <EmptyBox
                    title="No tips"
                    message={`You have no tips yet on your posts`}
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </TabsRoot>
      </div>
    </div>
  );
}

export default ProfileTabs;
