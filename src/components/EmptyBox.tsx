import React from "react";
import Lottie from "lottie-react";
import emptyAnim from "@/assets/lottie/empty.json";

type Props = {
  title?: string;
  message?: string;
};

const header = "Tab is empty";
const msg = "There nothing in this folder, kindly check back later";

function EmptyBox({ title = header, message = msg }: Props) {
  return (
    <div className="text-center">
      <Lottie animationData={emptyAnim} className="mb-3 h-60" loop={false} />
      <p className="text-2xl">{title}</p>
      <p className="text-medium">{message}</p>
    </div>
  );
}

export default EmptyBox;
