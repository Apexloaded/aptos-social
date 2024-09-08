import { routes } from "@/routes";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo/icon.png";

export function Icon() {
  return (
    <Image
      src={Logo}
      width={260}
      height={260}
      alt={`dexa`}
      className="h-8 w-8 rounded-full"
    />
  );
}
export function DexaLogo() {
  return (
    <Link
      href={routes.home}
      prefetch={true}
      className={`flex items-center gap-x-2`}
    >
      <Icon />
      <p className="text-lg font-black text-primary">
        <span className="text-dark dark:text-white">Aptos.</span>social
      </p>
    </Link>
  );
}
