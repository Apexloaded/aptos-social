import CommunityFeeds from '@/components/Community/Tabs/CommunityFeeds';
import CommunityTabs from '@/components/Community/Tabs/CommunityTabs';
import UsersToFollow from '@/components/Creator/UsersToFollow';
import Aside from '@/components/Layouts/Aside';
import Section from '@/components/Layouts/Section';
import SearchBox from '@/components/SearchBox';
import Trending from '@/components/Trending';
import { Button } from '@/components/ui/button';
import Header from '@/components/ui/header';
import { CircleFadingPlusIcon, Grid2x2PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Communities',
  description: 'Aptos social communities',
};

export default function Communities() {
  return (
    <div className="flex">
      <Section className="bg-white dark:bg-dark">
        <div className="bg-white px-5 flex items-center justify-between backdrop-blur-2xl dark:bg-dark mx-auto w-full sticky top-0 z-10">
          <Header title="Communities" isBack={false} />
        </div>
        <CommunityTabs />
      </Section>
      <Aside className="">
        <div className="flex flex-col gap-y-6 mt-2">
          <SearchBox className="ml-4" />
          <Trending />
          <UsersToFollow />
        </div>
      </Aside>
    </div>
  );
}
