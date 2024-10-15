import Container from '@/components/Layouts/Container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Aptos Social',
    default: 'Account', // a default is required when creating a template
  },
  description: 'Aptos social account',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Container>{children}</Container>;
}
