import Container from '@/components/Layouts/Container';
import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import WalletBalance from '@/components/Wallet/WalletBalance';
import WalletTabs from '@/components/Wallet/WalletTabs';

export default function Wallet() {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section isFull={true} className="bg-white dark:bg-dark w-full px-1">
          <div className="bg-white backdrop-blur-2xl px-3 dark:bg-dark mx-auto flex items-center justify-between w-full sticky top-0 z-10">
            <Header title="Wallet" isBack={false} />
          </div>
          <div className='mt-5'>
            <WalletBalance />
            <WalletTabs />
          </div>
        </Section>
      </div>
    </Container>
  );
}
