import React from "react";

function Aside({
  children,
  className
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return <div className={`w-full hidden lg:inline md:w-1/3 ${className}`}>{children}</div>;
}

export default Aside;
