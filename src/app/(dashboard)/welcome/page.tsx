import Welcome from "@/components/Auth/Welcome";
import { AptosSocialLogo } from "@/components/Icons/Icons";

export default function Register() {
  return (
    <div className="bg-primary/5 h-svh px-10 flex flex-col">
      <div className="py-5">
        <AptosSocialLogo />
      </div>
      <div className="max-w-md flex-1 flex flex-col items-center mx-auto h-full justify-center">
        <Welcome />
      </div>
    </div>
  );
}
