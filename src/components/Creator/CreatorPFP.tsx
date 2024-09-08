import Image from "next/image";
import React, { useEffect } from "react";
import { getFirstLetters } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { routes } from "@/routes";

type Props = {
  pfp?: string;
  username?: string;
  name?: string;
  className?: string;
};
function CreatorPFP({ pfp, username, name, className }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(routes.app.profile(`${username}`));
  }, [username]);

  const profile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    router.push(routes.app.profile(`${username}`));
  };

  return (
    <div
      role="button"
      onClick={profile}
      className={`w-10 relative ${className}`}
    >
      {pfp ? (
        <Image
          src={pfp}
          height={400}
          width={400}
          alt={"PFP"}
          placeholder="blur"
          blurDataURL="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
          className="h-10 w-10 rounded-full"
          priority={true}
        />
      ) : (
        <div className="h-10 w-10 bg-white/90 border border-primary rounded-full flex justify-center items-center">
          <p className="text-base font-semibold text-primary">
            {getFirstLetters(`${name}`)}
          </p>
        </div>
      )}
    </div>
  );
}

export default CreatorPFP;
