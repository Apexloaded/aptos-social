"use client";

import React, { ForwardedRef } from "react";

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  isOutline?: boolean;
}

const Switch = React.forwardRef(
  (
    { className, isOutline = true, checked, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>
  ) => (
    <label className="h-6 w-10">
      <input className="peer hidden" ref={ref} checked={checked} {...props} />
      <div className="h-6 w-10 rounded-full flex items-center justify-start px-[0.2rem] py-[0.15rem] transition-all bg-gray-200 duration-500 peer-checked:justify-end peer-checked:bg-primary">
        <div className="h-[1.1rem] w-[1.1rem] rounded-full duration-200 bg-white"></div>
      </div>
    </label>
  )
);
Switch.displayName = "Switch";
export default Switch;
