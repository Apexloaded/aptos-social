import Aside from '@/components/Layouts/Aside';
import Section from '@/components/Layouts/Section';
import Notifications from '@/components/Notifications/Notifications';
import Header from '@/components/ui/header';

export default function Notification() {
  return (
    <div className="flex space-x-5">
      <Section className="bg-muted dark:bg-dark-light">
        <div className="px-5 bg-muted/80 backdrop-blur-2xl dark:bg-dark-light/80 mx-auto w-full sticky top-0 z-10">
          <Header title="Notifications" isBack={false} />
        </div>
        <Notifications />
      </Section>
      <Aside className="pr-3">
        <div className="flex flex-col gap-y-5 mt-2"></div>
      </Aside>
    </div>
  );
}
