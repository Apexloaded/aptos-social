"use client";

import React from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  shiftBtn?: boolean;
};
function BackButton({ shiftBtn }: BackButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      onClick={() => router.back()}
      size="icon"
      className={shiftBtn ? "-translate-x-3" : ""}
    >
      <ArrowLeft height={23} />
    </Button>
  );
}

export default BackButton;
