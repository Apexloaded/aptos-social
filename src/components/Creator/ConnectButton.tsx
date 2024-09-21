'use client';

import React, { useState } from 'react';
import { Status } from './ProfileHeader';
import { Button } from '../ui/button';

type Props = {
  to: string;
  status?: Status;
};

function ConnectButton({ to, status }: Props) {
  // const { MessengerABI, dexaMessenger } = useDexa();
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isPending, setIsPending] = useState<boolean>(true);
  // const { loading, success, error } = useToast();
  // const { writeContractAsync, isPending } = useWriteContract();
  const sendConnectReq = async () => {
    try {
      // setIsLoading(true);
      // loading({ msg: "Initializing request" });
      // await writeContractAsync(
      //   {
      //     abi: MessengerABI,
      //     address: dexaMessenger,
      //     functionName: "sendConnectRequest",
      //     args: [to],
      //   },
      //   {
      //     onSuccess(data, variables, context) {
      //       success({ msg: "Request sent" });
      //       setIsLoading(false);
      //     },
      //     onError(err, variables, context) {
      //       error({ msg: "Request not sent" });
      //       setIsLoading(false);
      //     },
      //   }
      // );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      type="button"
      className="text-sm"
      onClick={sendConnectReq}
      disabled={isLoading || isPending || status?.isRequest}
    >
      {status?.isRequest ? 'Requested' : 'Connect'}
    </Button>
  );
}

export default ConnectButton;
