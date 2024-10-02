import React from "react";

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title: string;
  className?: string;
  value: string;
  onTabChange: (tabId: string) => void;
  activeTabId: string;
  isActiveBg?: boolean;
  isActiveText?: boolean;
  isCenter?: boolean;
}

function TabsHeader({
  title,
  className,
  value,
  onTabChange,
  activeTabId,
  isActiveBg,
  isActiveText,
  isCenter = true,
  ...prop
}: Props) {
  const bg = activeTabId === value && isActiveBg ? "bg-primary/10" : "";
  const textColor = activeTabId === value && isActiveText ? "text-primary" : "";
  const alignClass = isCenter ? "flex-1" : "flex-0"
  return (
    <div
      {...prop}
      onClick={() => onTabChange(value)}
      className={`py-4 font-medium relative select-none ${bg} text-dark/80 dark:text-secondary text-sm px-5 flex ${alignClass} items-center justify-center hover:bg-light cursor-pointer ${className}`}
    >
      <p className={`${textColor}`}>{title}</p>
      {activeTabId === value && (
        <div className={`h-1 bg-primary w-10 rounded-md absolute bottom-0`}></div>
      )}
    </div>
  );
}

export default TabsHeader;
