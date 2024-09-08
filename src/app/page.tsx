import Aside from "@/components/Layouts/Aside";
import Container from "@/components/Layouts/Container";
import Section from "@/components/Layouts/Section";
import { PostItem } from "@/components/Posts/PostItem";
import { Posts } from "@/components/Posts/Posts";
import { ToggleTheme } from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

export default function Home() {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section className="bg-muted dark:bg-dark-light px-5">
          <div className="max-w-md bg-muted dark:bg-dark-light mx-auto w-full sticky top-0">
            <Header title="Feeds" isBack={false} />
          </div>
          <Posts />
        </Section>
        <Aside className="pr-3">
          <div className="flex flex-col gap-y-5 mt-2">
            {/* <SearchComponent />
            <QuickView />
            <LiveOnDexa /> */}
          </div>
        </Aside>
      </div>
      {/* <div className="">
        <Button variant="default" size="sm">
          Hello
        </Button>
        <ToggleTheme />
      </div> */}
    </Container>
  );
}
