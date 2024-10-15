'use client';

import GoogleConnect from './connectors/GoogleConnector';

export function ListConnectors() {
  return (
    <div className="flex flex-col border border-primary/50 rounded-lg overflow-hidden">
      <GoogleConnect />
    </div>
  );
}
