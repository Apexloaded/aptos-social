import type { Metadata } from 'next';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import { routes } from '@/routes';
import Link from 'next/link';
import AccountSettings from '@/components/Settings/Account/AccountSetting';

export const metadata: Metadata = {
  title: 'Account',
};

export default function Account() {
  return (
    <div className="flex space-x-5">
      <Section
        isFull={true}
        className="bg-white dark:bg-dark w-full px-1"
      >
        <AccountSettings />
      </Section>
    </div>
  );
}
