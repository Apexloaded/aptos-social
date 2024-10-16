import CreateCollection from '@/components/Collections/CreateCollection';
import Aside from '@/components/Layouts/Aside';
import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';

export default function Collections() {
  return (
    <div className="flex space-x-5">
      <Section
        isFull={true}
        className="bg-muted dark:bg-dark-light w-full px-1"
      >
        <div className="bg-white backdrop-blur-2xl px-2 dark:bg-dark mx-auto flex items-center justify-between w-full sticky top-0 z-20">
          <Header title="Collections" />
        </div>
        <CreateCollection />
      </Section>
    </div>
  );
}
