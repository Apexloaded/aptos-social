import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import { routes } from '@/routes';

import Link from 'next/link';

export default function Explore() {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section
          isFull={true}
          className="bg-muted dark:bg-dark-light w-full px-1"
        >
          <div className="bg-muted/80 backdrop-blur-2xl pr-3 dark:bg-dark-light/80 mx-auto flex items-center justify-between w-full sticky top-0 z-10">
            <Header title="Explore" />
          </div>
        </Section>
      </div>
    </Container>
  );
}
