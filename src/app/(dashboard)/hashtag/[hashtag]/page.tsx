import Aside from '@/components/Layouts/Aside';
import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import { PostsByHashtag } from '@/components/Posts/PostByHashtag';
import Header from '@/components/ui/header';

type Props = {
  params: {
    hashtag: string;
  };
};
export default function Hashtag({ params }: Props) {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section className="bg-muted dark:bg-dark-light px-5">
          <div className="bg-muted/80 backdrop-blur-2xl dark:bg-dark-light/80 mx-auto w-full sticky top-0 z-10">
            <Header title={params.hashtag} isBack={true} shiftBtn={true} />
          </div>
          <PostsByHashtag hashtag={params.hashtag} />
        </Section>
        <Aside className="pr-3">
          <div className="flex flex-col gap-y-5 mt-2"></div>
        </Aside>
      </div>
    </Container>
  );
}
