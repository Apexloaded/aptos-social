import { getCommunity } from '@/aptos/view/community.view';
import CommunityDetailsTabs from '@/components/Community/Details/CommunityDetailsTabs';
import CommunityView from '@/components/Community/Details/CommunityView';
import CommunityFeeds from '@/components/Community/Tabs/CommunityFeeds';
import CommunityTabs from '@/components/Community/Tabs/CommunityTabs';
import UsersToFollow from '@/components/Creator/UsersToFollow';
import Aside from '@/components/Layouts/Aside';
import Section from '@/components/Layouts/Section';
import SearchBox from '@/components/SearchBox';
import Trending from '@/components/Trending';
import Header from '@/components/ui/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Communities',
  description: 'Aptos social communities',
};

type Props = {
  params: {
    address: string;
  };
};

export default function CommunityDetails({ params }: Props) {
  return (
    <div className="flex space-x-5">
      <Section className="bg-white dark:bg-dark">
        <CommunityView address={params.address} />
        <CommunityDetailsTabs address={params.address} />
      </Section>
      <Aside className="pr-3">
        <div className="flex flex-col gap-y-5 mt-2"></div>
      </Aside>
    </div>
  );
}
