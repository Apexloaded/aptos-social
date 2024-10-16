'use client';

import React, { useState, useEffect } from 'react';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { getTrendingHashtags } from '@/aptos/view/trends.view';
import { ITrends } from '@/interfaces/trends.interface';
import Link from 'next/link';
import { routes } from '@/routes';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};
export default function TrendingKeywords({ className }: Props) {
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
    <div className={cn('flex flex-col bg-white dark:bg-dark-light', className)}>
      {trends.map((trend, i) => (
        <Link
          key={i}
          prefetch={true}
          href={routes.app.hashtag.hashtag(trend.keyword)}
          className="flex-1 py-2 px-4 hover:bg-secondary dark:hover:bg-dark/70"
        >
          <p className="text-dark/70 dark:text-white/70 text-sm">
            {i + 1} - Trending
          </p>
          <p className="lowercase font-semibold dark:text-white">
            #{trend.keyword}
          </p>
          <p className="text-dark/70 text-sm dark:text-white/70">
            {trend.decayed_frequency} Frequecy
          </p>
        </Link>
      ))}
    </div>
  );
}
