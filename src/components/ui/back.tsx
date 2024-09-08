"use client";

import React from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function BackButton() {
  const router = useRouter();
  return (
    <Button onClick={() => router.back()} size="icon">
      <ArrowLeft height={23} />
    </Button>
  );
}

export default BackButton;
