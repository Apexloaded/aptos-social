'use client';

import React, { useEffect, useState } from 'react';
import { getTrendingHashtags } from '@/aptos/view/trends.view';
import { QueryKeys } from '@/config/query-keys';
import { routes } from '@/routes';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ITrends } from '@/interfaces/trends.interface';

export default function Trending() {
  const [trends, setTrends] = useState<ITrends[]>([]);
  const { data } = useQuery({
    queryKey: [QueryKeys.Trends],
    queryFn: () => getTrendingHashtags(),
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      const filteredTrends = data
        .filter((t) => t.decayed_frequency > 0)
        .sort((a, b) => b.decayed_frequency - a.decayed_frequency)
        .slice(0, 8);
      setTrends(filteredTrends);
    }
  }, [data]);

  return (
    <div>
      <p className="text-dark dark:text-white mb-3 text-xl font-semibold">
        Trending Topic
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        {trends.map((trend, i) => (
          <Link
            key={i}
            href={routes.app.hashtag.hashtag(trend.keyword)}
            className="bg-secondary rounded-full px-3 py-1"
          >
            <p className="text-sm lowercase">#{trend.keyword}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
