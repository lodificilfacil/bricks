'use client';

import * as React from 'react';
import { useQueryStates } from 'nuqs';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@workspace/ui/components/pagination';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

import { searchParams } from '~/components/organizations/slug/contents/contents-search-params';
import { useTransitionContext } from '~/hooks/use-transition-context';
import { ContentCardDto } from '~/types/dtos/content-dto';
import { ContentCard } from './content-card';

interface ContentsListProps {
  contents: ContentCardDto[];
  totalCount?: number; // filteredCount
  currentUserId?: string;
  isOrgAdmin?: boolean;
}

function getWindowPages(
  current: number,
  last: number,
  windowSize = 5
): number[] {
  const start = Math.max(0, current - Math.floor(windowSize / 2));
  const end = Math.min(last - 1, start + windowSize - 1);
  const realStart = Math.max(0, end - windowSize + 1);
  const pages: number[] = [];
  for (let p = realStart; p <= end; p++) pages.push(p);
  return pages;
}

export function ContentsList({
  contents,
  totalCount = 0,
  currentUserId,
  isOrgAdmin
}: ContentsListProps): React.JSX.Element {
  const { startTransition } = useTransitionContext();

  const [{ pageIndex, pageSize }, setPaging] = useQueryStates(
    { pageIndex: searchParams.pageIndex, pageSize: searchParams.pageSize },
    { history: 'push', startTransition, shallow: false }
  );

  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pages = getWindowPages(currentPage, pageCount, 5);

  const goToPage = (p: number) => setPaging({ pageIndex: p, pageSize });
  const goPrev = () => currentPage > 0 && goToPage(currentPage - 1);
  const goNext = () => currentPage < pageCount - 1 && goToPage(currentPage + 1);

  // 🔧 Clamp automático: si el total baja y el índice actual queda fuera de rango,
  // ajústalo al último índice válido para evitar una página vacía.
  React.useEffect(() => {
    const newPageCount = Math.max(
      1,
      Math.ceil(totalCount / Math.max(1, pageSize))
    );
    const lastIndex = newPageCount - 1;
    if (pageIndex > lastIndex) {
      setPaging({ pageIndex: lastIndex, pageSize });
    }
  }, [totalCount, pageSize, pageIndex, setPaging]);

  return (
    <div className="relative flex h-full flex-col">
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              currentUserId={currentUserId}
              isOrgAdmin={isOrgAdmin}
            />
          ))}
        </div>
      </ScrollArea>

      {totalCount > pageSize && (
        <div className="border-t bg-background px-4 py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={goPrev} />
              </PaginationItem>

              {pages[0] > 0 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      isActive={0 === currentPage}
                      onClick={() => goToPage(0)}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {pages[0] > 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {pages.map((p, idx) => {
                const prev = pages[idx - 1];
                const showEllipsis = idx > 0 && p - (prev ?? 0) > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        isActive={p === currentPage}
                        onClick={() => goToPage(p)}
                      >
                        {p + 1}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}

              {pages[pages.length - 1] < pageCount - 1 && (
                <>
                  {pages[pages.length - 1] < pageCount - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      isActive={pageCount - 1 === currentPage}
                      onClick={() => goToPage(pageCount - 1)}
                    >
                      {pageCount}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext onClick={goNext} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
