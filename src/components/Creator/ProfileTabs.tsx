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
import UserFeeds from './UserFeeds';
import Collected from './Collected';
import EmptyBox from '../EmptyBox';
import { useAccount } from '@/context/account.context';
import { UserInterface } from '@/interfaces/user.interface';

type Props = {
  username: string;
};
function ProfileTabs({ username }: Props) {
  const [activeTab, setActiveTab] = useState('tab1');
  const [posts, setPosts] = useState<IPostItem[]>([]);
  const [user, setUser] = useState<UserInterface>();
  const [replies, setReplies] = useState<IPostItem[]>([]);
  const [collected, setCollected] = useState<IPostItem[]>([]);
  const { address } = useAccount();
  const { user: authUser, findCreator } = useAuth();
  const { data: userData } = findCreator(username);

  const { data } = useQuery({
    queryKey: [],
    queryFn: () => getOwnedPosts(username),
    enabled: !!username,
  });

  useEffect(() => {
    if (userData) {
      const { created_at, ...payload } = userData;
      const date = new Date(Number(created_at) * 1000).toISOString();
      setUser({ ...payload, created_at: date });
    }
  }, [userData]);

  useEffect(() => {
    if (data && data.length > 0 && user) {
      const _posts = data as IPostItem[];
      const filterReplies = sortPostByDate(
        _posts.filter((p) => p.post.is_comment)
      );
      const sortedPost = sortPostByDate(
        _posts.filter((p) => !p.post.is_comment && p.post.author == user?.wallet)
      );
      const collectedPost = sortPostByDate(
        _posts.filter((p) => p.post.collector == user?.wallet)
      );
      setReplies(filterReplies);
      setPosts(sortedPost);
      setCollected(collectedPost);
    }
  }, [data, user]);

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-5xl w-full mx-auto mt-5">
      <div className="overflow-scroll scrollbar-hide pb-40 lg:pb-10">
        <TabsRoot>
          <TabsList className="border-b border-light overflow-x-auto scrollbar-hide">
            <TabsHeader
              title="Collectibles"
              value="tab1"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Collected"
              value="tab2"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Replies"
              value="tab3"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            <TabsHeader
              title="Community"
              value="tab4"
              activeTabId={activeTab}
              onTabChange={onTabChange}
            />
            {authUser?.username == username && (
              <TabsHeader
                title="Tips"
                value="tab5"
                activeTabId={activeTab}
                onTabChange={onTabChange}
              />
            )}
          </TabsList>
          <TabsContent value="tab1" activeTabId={activeTab}>
            <UserFeeds
              posts={posts}
              title="No collectible found"
              msg={`${username} haven't minted any collectible yet`}
            />
          </TabsContent>
          <TabsContent value="tab2" activeTabId={activeTab}>
            <Collected posts={collected} username={`${username}`} />
          </TabsContent>
          <TabsContent value="tab3" activeTabId={activeTab}>
            <UserFeeds
              posts={replies}
              title="No reply found"
              msg={`${username} have not replied any post yet`}
            />
          </TabsContent>
          <TabsContent value="tab4" activeTabId={activeTab}>
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
            <TabsContent value="tab5" activeTabId={activeTab}>
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
