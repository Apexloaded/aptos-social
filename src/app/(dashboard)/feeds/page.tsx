import UsersToFollow from '@/components/Creator/UsersToFollow';
import Aside from '@/components/Layouts/Aside';
import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import { Posts } from '@/components/Posts/Posts';
import SearchBox from '@/components/SearchBox';
import Trending from '@/components/Trending';
import TrendingKeywords from '@/components/Trends/TrendingKeywords';
import Header from '@/components/ui/header';

export default function Feeds() {
  return (
    <Container>
      <div className="flex">
        <Section className="bg-muted dark:bg-dark-light px-5">
          <div className="bg-muted/80 backdrop-blur-2xl dark:bg-dark-light/80 mx-auto w-full sticky top-0 z-10">
            <Header title="Feeds" isBack={false} />
          </div>
          <Posts />
        </Section>
        <Aside className="">
          <div className="flex flex-col gap-y-6 mt-2">
            <SearchBox className='ml-4' />
            <Trending />
            <UsersToFollow />
          </div>
        </Aside>
      </div>
    </Container>
  );
}
