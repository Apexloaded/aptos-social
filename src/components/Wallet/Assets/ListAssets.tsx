'use client';

import React, { useMemo, useState } from 'react';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@/context/account.context';
import { aptosClient } from '@/utils/aptosClient';
import EmptyBox from '@/components/EmptyBox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import AssetsBodyItems from './AssetsBodyItems';
import { useGetFungibleAssets } from '@/hooks/queries/useGetFungibleAssets';

const ITEMS_PER_PAGE = 25;

export default function ListAssets() {
  const { address, connected } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useGetFungibleAssets({
    address,
    currentPage,
    withPagination: true,
    enabled: connected && !!address,
  });

  //   const { data, isLoading } = useQuery({
  //     queryKey: [QueryKeys.FungibleAssets, address, currentPage],
  //     queryFn: async () => {
  //       try {
  //         const f_assets = await aptosClient().queryIndexer<{
  //           current_fungible_asset_balances: {
  //             amount: number;
  //             asset_type: string;
  //             metadata: {
  //               name: string;
  //               decimals: number;
  //               symbol: string;
  //               token_standard: string;
  //               icon_uri: string;
  //             };
  //           }[];
  //           current_fungible_asset_balances_aggregate: {
  //             aggregate: {
  //               count: number;
  //             };
  //           };
  //         }>({
  //           query: {
  //             variables: {
  //               owner_address: address,
  //               offset: (currentPage - 1) * ITEMS_PER_PAGE,
  //               limit: ITEMS_PER_PAGE,
  //             },
  //             query: `
  //                     query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
  //                         current_fungible_asset_balances(
  //                             where: {owner_address: {_eq: $owner_address}}
  //                             limit: $limit
  //                             offset: $offset
  //                         ) {
  //                             amount
  //                             asset_type
  //                             metadata {
  //                                 name
  //                                 decimals
  //                                 symbol
  //                                 token_standard
  //                                 icon_uri
  //                                 project_uri
  //                             }
  //                         }
  //                         current_fungible_asset_balances_aggregate(where: {owner_address: {_eq: $owner_address}}) {
  //                             aggregate {
  //                                 count
  //                             }
  //                         }
  //                     }
  //                 `,
  //           },
  //         });
  //         console.log(f_assets);
  //         return {
  //           assets: f_assets.current_fungible_asset_balances,
  //           totalCount:
  //             f_assets.current_fungible_asset_balances_aggregate.aggregate.count,
  //         };
  //       } catch (error) {
  //         return null;
  //       }
  //     },
  //     enabled: connected && !!address,
  //   });

  const assets = useMemo(() => data?.coins || [], [data]);
  const totalPages = useMemo(
    () => Math.ceil((data?.totalCount || 0) / ITEMS_PER_PAGE),
    [data?.totalCount]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 4;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="start">
          <PaginationLink
            className="rounded-md dark:text-white"
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis className="dark:text-white" />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            className="rounded-md dark:text-white"
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis className="dark:text-white" />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key="end">
          <PaginationLink
            className="rounded-md dark:text-white"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1 max-w-full overflow-auto border border-light rounded-lg">
        <table className="table-auto w-full">
          <thead className="border-b border-light px-4">
            <tr className="h-14 text-left font-bold">
              <th className="px-4 text-dark dark:text-white text-sm text-center">
                Name
              </th>
              <th className="px-4 text-dark dark:text-white text-sm text-center">
                Balance
              </th>
              <th className="px-4 text-dark dark:text-white text-sm text-center">
                Type
              </th>
              <th className="px-4 text-dark dark:text-white text-sm text-center">
                Coin Type
              </th>
              <th className="px-4 text-dark dark:text-white text-sm text-center"></th>
            </tr>
          </thead>
          <tbody>
            {assets && assets.length > 0 ? (
              <>
                {assets.map((asset, index) => (
                  <AssetsBodyItems key={index} coins={asset} />
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={7} className="pb-24">
                  <EmptyBox
                    title="No Asset"
                    message="You currently do not have any asset"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                //disabled={currentPage === 1}
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                //disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
