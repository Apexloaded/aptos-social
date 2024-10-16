import BookmarkFeeds from '@/components/Bookmarks/BookmarkFeeds';
import Aside from '@/components/Layouts/Aside';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import React from 'react';

function BookmarkPage() {
  return (
    <div className="flex space-x-5">
      <Section className="bg-muted dark:bg-dark-light px-5">
        <div className="bg-muted/80 backdrop-blur-2xl dark:bg-dark-light/80 mx-auto w-full sticky top-0 z-10">
          <Header title="Bookmarks" isBack={false} />
        </div>
        <BookmarkFeeds />
      </Section>
      <Aside className="pr-3">
        <div className="flex flex-col gap-y-5 mt-2"></div>
      </Aside>
    </div>
  );
}

export default BookmarkPage;
