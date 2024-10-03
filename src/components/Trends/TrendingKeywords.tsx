'use client';

import React, { useState, useEffect } from 'react';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { getTrendingHashtags } from '@/aptos/view/trends.view';
import { ITrends } from '@/interfaces/trends.interface';
import Link from 'next/link';
import { routes } from '@/routes';

export default function TrendingKeywords() {
  const [trends, setTrends] = useState<ITrends[]>([]);
  const { data } = useQuery({
    queryKey: [QueryKeys.Trends],
    queryFn: () => getTrendingHashtags(),
  });

  useEffect(() => {
    if (data) {
      const filteredTrends = data
        .filter((t) => t.decayed_frequency > 0)
        .sort((a, b) => b.decayed_frequency - a.decayed_frequency)
        .slice(0, 8);
      setTrends(filteredTrends);
    }
  }, [data]);

  return (
    <div className="flex flex-col">
      {trends.map((trend, i) => (
        <Link
          key={i}
          href={routes.app.hashtag.hashtag(trend.keyword)}
          className="flex-1 py-2 px-4 hover:bg-secondary"
        >
          <p className="text-dark/70 text-sm">{i + 1} - Trending</p>
          <p className="lowercase font-semibold">#{trend.keyword}</p>
          <p className="text-dark/70 text-sm">{trend.decayed_frequency} Frequecy</p>
        </Link>
      ))}
    </div>
  );
}
