'use client';

import GoogleConnect from './connectors/GoogleConnector';

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export function ListConnectors({ isOpen, setIsOpen }: Props) {
  return (
    <div className="flex flex-col border border-primary/50 rounded-lg overflow-hidden">
      <GoogleConnect />
    </div>
  );
}
