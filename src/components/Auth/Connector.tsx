'use client';

export type IConnector = {
  id: string;
  name: string;
  icon: React.FC;
  onClick: () => void;
};
interface ConnectorProps {
  connector: IConnector;
}
export function Connector({ connector }: ConnectorProps) {
  const { onClick } = connector;

  return (
    <div
      onClick={onClick}
      role="button"
      className="flex items-center justify-between px-4 py-3 gap-4 border-b border-primary/50 last-of-type:border-b-0"
    >
      <div className="flex items-center w-full gap-4">
        <div className="flex-1 items-center flex gap-1">
          <connector.icon />
          <p className="text-base font-normal">{connector.name}</p>
        </div>
      </div>
    </div>
  );
}
