'use client';

import React, { useMemo, useState } from 'react';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@/context/account.context';
import { aptosClient } from '@/utils/aptosClient';
import { ITransaction } from '@/interfaces/transaction.interface';
import EmptyBox from '@/components/EmptyBox';
import TxBodyItems from './TxBodyItems';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 25;

export default function ListTransactions() {
  const { address, connected } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Transactions, address, currentPage],
    queryFn: async () => {
      try {
        const txns = await aptosClient().queryIndexer<{
          account_transactions: ITransaction[];
          account_transactions_aggregate: any;
        }>({
          query: {
            variables: {
              address,
              offset: (currentPage - 1) * ITEMS_PER_PAGE,
              limit: ITEMS_PER_PAGE,
            },
            query: `
                    query GetAccountTransactions($address: String, $offset: Int, $limit: Int) {
                        account_transactions(
                            where: {
                                account_address: {_eq: $address},
                            }
                            order_by: {
                                user_transaction: {timestamp: desc}
                            }
                            offset: $offset
                            limit: $limit
                        ) {
                            transaction_version
                            user_transaction {
                                block_height
                                sender
                                timestamp
                                gas_unit_price
                                entry_function_id_str
                                epoch
                                expiration_timestamp_secs
                                max_gas_amount
                                parent_signature_type
                                sequence_number
                                version
                            }
                            account_address
                            coin_activities {
                                amount
                                activity_type
                            }
                        }
                        account_transactions_aggregate(where: {account_address: {_eq: $address}}) {
                            aggregate {
                                count
                            }
                        }
                    }
                `,
          },
        });
        return {
          transactions: txns.account_transactions as ITransaction[],
          totalCount: txns.account_transactions_aggregate.aggregate
            .count as number,
        };
      } catch (error) {
        return null;
      }
    },
    enabled: connected && !!address,
  });

  const transactions = useMemo(() => data?.transactions || [], [data]);
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
              <th className="px-4 text-dark dark:text-white text-sm w-14 text-center">
                Version
              </th>
              <th className="px-4 text-dark dark:text-white text-sm">From</th>
              <th className="px-4 text-dark dark:text-white text-sm">To</th>
              <th className="px-4 text-dark dark:text-white text-sm w-24">
                Amount
              </th>
              <th className="px-4 text-dark dark:text-white text-sm w-32">
                Gas
              </th>
              <th className="px-4 text-dark dark:text-white text-sm">
                Function
              </th>
              <th className="px-4 text-dark dark:text-white text-sm w-32">
                Age
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? (
              <>
                {transactions.map((tx, index) => (
                  <TxBodyItems key={index} tx={tx} />
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={7} className="pb-24">
                  <EmptyBox
                    title="No Transaction"
                    message="You currently do not have any transaction"
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
