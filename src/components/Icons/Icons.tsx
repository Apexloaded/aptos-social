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
      alt={`aptos-social-icon`}
      className="h-8 w-8 rounded-full"
    />
  );
}
export function AptosSocialLogo() {
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

export function GoogleLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2 h-5 w-5"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.54 12.7613C23.54 11.9459 23.4668 11.1618 23.3309 10.4091H12.5V14.8575H18.6891C18.4225 16.295 17.6123 17.5129 16.3943 18.3284V21.2138H20.1109C22.2855 19.2118 23.54 16.2636 23.54 12.7613Z"
        fill="#4285F4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4995 23.9998C15.6045 23.9998 18.2077 22.97 20.1104 21.2137L16.3938 18.3282C15.364 19.0182 14.0467 19.4259 12.4995 19.4259C9.50425 19.4259 6.96902 17.403 6.0647 14.6848H2.22266V17.6644C4.11493 21.4228 8.00402 23.9998 12.4995 23.9998Z"
        fill="#34A853"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.06523 14.6851C5.83523 13.9951 5.70455 13.2581 5.70455 12.5001C5.70455 11.7422 5.83523 11.0051 6.06523 10.3151V7.33557H2.22318C1.44432 8.88807 1 10.6444 1 12.5001C1 14.3558 1.44432 16.1122 2.22318 17.6647L6.06523 14.6851Z"
        fill="#FBBC05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4995 5.57386C14.1879 5.57386 15.7038 6.15409 16.8956 7.29364L20.194 3.99523C18.2024 2.13955 15.5992 1 12.4995 1C8.00402 1 4.11493 3.57705 2.22266 7.33545L6.0647 10.315C6.96902 7.59682 9.50425 5.57386 12.4995 5.57386Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function Diamond({
  height = '25',
  width = '25',
}: {
  height?: string;
  width?: string;
}) {
  return (
    <svg
      height={height}
      width={width}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      className="animate-pulse"
    >
      <path
        style={{ fill: '#FFD782' }}
        d="M256,512c-121.3,0-219.985-98.686-219.985-219.985c0-121.3,98.685-219.986,219.985-219.986
	s219.985,98.686,219.985,219.986C475.985,413.315,377.3,512,256,512z M256,143.851c-81.698,0-148.163,66.466-148.163,148.164
	S174.303,440.178,256,440.178s148.163-66.466,148.163-148.163C404.164,210.317,337.698,143.851,256,143.851z"
      />
      <path
        style={{ opacity: '0.1' }}
        d="M118.683,120.285l46.152,55.012c25.157-19.693,56.814-31.446,91.165-31.446
	s66.008,11.753,91.165,31.446l46.152-55.012C355.655,90.109,307.903,72.03,256,72.03C204.097,72.029,156.345,90.108,118.683,120.285
	z"
      />
      <polygon
        style={{ fill: '#99E7FF' }}
        points="222.15,0 187.891,74.189 324.109,74.189 289.85,0 "
      />
      <polygon
        style={{ fill: '#8AD0E6' }}
        points="289.85,0 289.85,0 324.109,74.189 324.109,74.189 392.928,74.189 348.731,0 "
      />
      <polygon
        style={{ fill: '#B3EDFF' }}
        points="222.15,0 222.15,0 163.269,0 119.072,74.189 187.891,74.189 187.891,74.189 "
      />
      <polygon
        style={{ fill: '#99E7FF' }}
        points="324.109,74.189 256,237.402 392.928,74.189 "
      />
      <polygon
        style={{ fill: '#8AD0E6' }}
        points="187.891,74.189 119.072,74.189 256,237.402 "
      />
      <polygon
        style={{ fill: '#B3EDFF' }}
        points="187.891,74.189 256,237.404 324.109,74.189 "
      />
    </svg>
  );
}