import ProfileHeader from '@/components/Creator/ProfileHeader';
import ProfileTabs from '@/components/Creator/ProfileTabs';
import Aside from '@/components/Layouts/Aside';
import Section from '@/components/Layouts/Section';

type Props = {
  params: {
    username: string;
  };
};
export default function Profile({ params }: Props) {
  return (
    <div className="flex space-x-5">
      <Section className="bg-white dark:bg-dark">
        <ProfileHeader username={params.username} />
        <ProfileTabs username={params.username} />
      </Section>
      <Aside className="pr-3">
        <div className="flex flex-col gap-y-5 mt-2"></div>
      </Aside>
    </div>
  );
}
