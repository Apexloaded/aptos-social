import Aside from "@/components/Layouts/Aside";
import Container from "@/components/Layouts/Container";
import Section from "@/components/Layouts/Section";
import { PostDetails } from "@/components/Posts/PostDetails";
import { PostItem } from "@/components/Posts/PostItem";
import { Posts } from "@/components/Posts/Posts";
import { ToggleTheme } from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";

export default function MintDetails() {
  return (
    <Container>
      <div className="flex space-x-5">
        <Section className="">
          <div className="backdrop-blur-2xl px-5 w-full sticky top-0 z-10">
            <Header title="Post" isBack={true} shiftBtn={true} />
          </div>
          <PostDetails />
        </Section>
        {/* <Aside className="pr-3">
          <div className="flex flex-col gap-y-5 mt-2"></div>
        </Aside> */}
      </div>
    </Container>
  );
}
