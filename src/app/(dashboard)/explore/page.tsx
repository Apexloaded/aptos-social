import Section from '@/components/Layouts/Section';
import SearchBox from '@/components/SearchBox';
import TrendingKeywords from '@/components/Trends/TrendingKeywords';
import { TrendingPosts } from '@/components/Trends/TrendingPosts';
import Header from '@/components/ui/header';

export default function Explore() {
  return (
    <div className="flex space-x-5">
      <Section className="bg-secondary dark:bg-dark w-full">
        <div className="bg-white backdrop-blur-2xl px-4 dark:bg-dark-light/80 mx-auto flex items-center justify-between w-full sticky top-0 z-10">
          <Header title="Explore" isBack={false} />
        </div>
        <SearchBox className="dark:bg-dark" />
        <TrendingKeywords className="py-3" />
        <TrendingPosts />
      </Section>
    </div>
  );
}
