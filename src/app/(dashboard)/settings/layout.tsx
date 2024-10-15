import SettingsInnerLayout from '@/components/Settings/Layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Settings Page',
    default: 'Settings', // a default is required when creating a template
  },
  description: 'Aptos social settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsInnerLayout>{children}</SettingsInnerLayout>;
}
