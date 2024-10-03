import CreateCollection from '@/components/Collections/CreateCollection';
import ListCollections from '@/components/Collections/ListCollections';
import Aside from '@/components/Layouts/Aside';
import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import { routes } from '@/routes';
import Link from 'next/link';

export default function Collections() {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section
          isFull={true}
          className="bg-muted dark:bg-dark-light w-full px-1"
        >
          <div className="bg-muted/80 backdrop-blur-2xl px-3 dark:bg-dark-light/80 mx-auto flex items-center justify-between w-full sticky top-0 z-10">
            <Header title="Collections" isBack={false} />
            <Link
              className="bg-primary text-white px-4 py-1 rounded-sm hover:bg-primary/90"
              href={routes.app.collections.create}
            >
              Add Collection
            </Link>
          </div>
          <ListCollections />
        </Section>
      </div>
    </Container>
  );
}
