"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";

export function HelperProvider() {
  return (
    <>
      <ProgressBar
        height="4px"
        color="#4cae4f"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <Toaster />
    </>
  );
}
