"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatWalletAddress } from "@/utils/helpers";
import {
  BadgeCheckIcon,
  ShieldEllipsisIcon,
  Wallet2Icon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/redux.hook";
import useToast from "@/hooks/toast.hook";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { HOSTNAME } from "@/config/constants";
import { getNonce, authenticate } from "@/actions/auth.action";
import { routes } from "@/routes";

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

function SignModal({ setIsOpen, isOpen }: Props) {
  const router = useRouter();
  const { signMessage, account, disconnect, signMessageAndVerify } =
    useWallet();
  const { loading, success, error, updateLoading } = useToast();
  const dispatch = useAppDispatch();

  const close = () => {
    setIsOpen(false);
  };

  const initSignMessage = async () => {
    try {
      if (!account) return;
      loading({ msg: "Initializing..." });

      const res = await getNonce(account.address);
      if (!res.status) {
        error({ msg: "Failed to get nonce" });
        return;
      }

      updateLoading({ msg: "Authenticating..." });
      const isVerified = await signMessageAndVerify({
        address: true,
        application: true,
        chainId: true,
        message:
          "For your security and convenience, please sign this signature with your wallet address.",
        nonce: res.data.nonce,
      });
      if (isVerified) {
        await authenticate(account, res.data.nonce);
        success({ msg: "Successfully signed in!" });
        // dispatch(setAuth(true));
        router.push(routes.app.home);
      } else {
        error({ msg: "Something went wrong" });
      }
    } catch (e: any) {
      error({ msg: e.code === 4001 ? "Failed to sign in!" : e.response.data });
    }
  };

  return (
    <div className="w-full max-w-md p-5 mx-auto">
      <div className="bg-white rounded-3xl p-5 transition-transform duration-500">
        <div className="pb-6 flex items-center justify-between">
          <Button size="icon" className="text-primary bg-primary/20">
            <Wallet2Icon height={18} />
          </Button>
          <p>{formatWalletAddress(`${account?.address}`)}</p>
          <Button
            size="icon"
            variant={"ghost"}
            className="text-dark hover:text-primary hover:bg-primary/20"
            onClick={close}
          ></Button>
        </div>
        <div className="body">
          <div className="flex items-center flex-col">
            <div className="bg-primary rounded-full h-12 flex items-center justify-center w-12">
              <ShieldEllipsisIcon size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg mt-1">Signature request</p>
          </div>
          <div className="px-6">
            <div className="mt-5 border border-medium/40 rounded-xl p-3">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-primary font-semibold">Aptos Social</p>
                    <BadgeCheckIcon
                      size={18}
                      className="text-primary fill-primary stroke-white"
                    />
                  </div>
                  <p className="text-medium text-sm">https://{HOSTNAME}</p>
                </div>
                <div className="border-t border-medium/40"></div>
                <p className="">
                  For your security and convenience, please sign this signature
                  with your wallet address.
                </p>
              </div>
            </div>
            <div className="flex items-center mb-6 justify-between gap-4 mt-10">
              <Button
                className="rounded-3xl flex-1"
                variant={"outline"}
                onClick={disconnect}
              >
                Disconnect
              </Button>
              <Button
                className="rounded-3xl flex-1"
                onClick={() => initSignMessage()}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignModal;
