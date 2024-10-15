import CreateCommunity from '@/components/Community/CreateCommunity';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import { Suspense } from 'react';

export default function NewCommunity() {
  return (
    <div className="flex space-x-5">
      <Section
        isFull={true}
        className="bg-muted dark:bg-dark-light w-full px-1"
      >
        <div className="bg-white backdrop-blur-2xl px-2 dark:bg-dark mx-auto flex items-center justify-between w-full sticky top-0 z-20">
          <Header title="Community" />
        </div>
        <Suspense>
          <CreateCommunity />
        </Suspense>
      </Section>
    </div>
  );
}
