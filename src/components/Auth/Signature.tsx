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
import {
  useWallet,
  SignMessagePayload,
} from "@aptos-labs/wallet-adapter-react";
import { HOSTNAME } from "@/config/constants";
import { Dialog, DialogPanel } from "@headlessui/react";

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
};

function SignInModal({ setIsOpen, isOpen }: Props) {
  const router = useRouter();
  const { signMessage, account } = useWallet();
  const { loading, success, error, updateLoading } = useToast();
  const dispatch = useAppDispatch();

  const close = () => {
    setIsOpen(false);
  };

  const initSignMessage = async () => {
    try {
      if (!account) return;
      loading({ msg: "Initializing..." });

      const response = await fetch(
        `/api/auth/generate-nonce?address=${account.address}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      console.log(data);

      updateLoading({ msg: "Authenticating..." });
      const signaturePayload = await signMessage({
        address: true,
        application: true,
        chainId: true,
        message:
          "For your security and convenience, please sign this signature with your wallet address.",
        nonce: "res.data.nonce",
      });
      const signature = signaturePayload.signature.toString();
      console.log(signaturePayload);
      // const verifyRes = await verifyNonce({
      //   signature,
      //   message: JSON.stringify(message),
      // });
      // if (verifyRes?.status) {
      //   await findCreator();
      //   setModal(false);
      //   dispatch(setAuth(true));
      //   success({ msg: "Successfully signed in!" });
      //   router.push(routes.app.home);
      // }
      // if (!verifyRes?.status) {
      //   error({ msg: "Something went wrong" });
      // }
    } catch (e: any) {
      error({ msg: e.code === 4001 ? "Failed to sign in!" : e.response.data });
    }
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
      <div className="fixed bg-dark/50 backdrop-blur-sm inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md p-5 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <div className="bg-white rounded-3xl p-5 transition-transform duration-500">
              <div className="pb-6 flex items-center justify-between">
                <Button size="icon" className="text-primary bg-primary/20">
                  <Wallet2Icon height={18} />
                </Button>
                <p>{formatWalletAddress(`${account?.address}`)}</p>
                <Button
                  size="icon"
                  className="text-dark hover:text-primary hover:bg-primary/20"
                  onClick={close}
                >
                  <XIcon height={18} />
                </Button>
              </div>
              <div className="body">
                <div className="flex items-center flex-col">
                  <div className="bg-primary rounded-full h-12 flex items-center justify-center w-12">
                    <ShieldEllipsisIcon size={30} className="text-white" />
                  </div>
                  <p className="font-semibold text-lg mt-1">
                    Signature request
                  </p>
                </div>
                <div className="px-6">
                  <div className="mt-5 border border-medium/40 rounded-xl p-3">
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-primary font-semibold">
                            Aptos Social
                          </p>
                          <BadgeCheckIcon
                            size={18}
                            className="text-primary fill-primary stroke-white"
                          />
                        </div>
                        <p className="text-medium text-sm">
                          https://{HOSTNAME}
                        </p>
                      </div>
                      <div className="border-t border-medium/40"></div>
                      <p className="">
                        For your security and convenience, please sign this
                        signature with your wallet address.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-6 justify-between gap-4 mt-10">
                    <Button
                      className="rounded-3xl flex-1"
                      variant={"outline"}
                      onClick={close}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="rounded-3xl flex-1"
                      onClick={() => initSignMessage()}
                    >
                      Sign
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default SignInModal;
