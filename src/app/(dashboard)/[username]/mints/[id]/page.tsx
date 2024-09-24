import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import { PostDetails } from '@/components/Posts/PostDetails';
import Header from '@/components/ui/header';

type Props = {
  params: {
    username: string;
    id: string;
  };
};
export default async function MintDetails({ params }: Props) {
  const { id } = params;
  return (
    <Container>
      <div className="flex space-x-5">
        <Section className="">
          <div className="backdrop-blur-2xl px-5 w-full sticky top-0 z-10">
            <Header title="Post" isBack={true} shiftBtn={true} />
          </div>
          <PostDetails id={id} />
        </Section>
        {/* <Aside className="pr-3">
          <div className="flex flex-col gap-y-5 mt-2"></div>
        </Aside> */}
      </div>
    </Container>
  );
}
