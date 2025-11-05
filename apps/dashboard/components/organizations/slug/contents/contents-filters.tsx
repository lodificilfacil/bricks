'use client';

import * as React from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  LayersIcon,
  LayoutIcon,
  ListIcon
} from 'lucide-react';
import { useQueryState } from 'nuqs';

import { Button } from '@workspace/ui/components/button';
import { InputSearch } from '@workspace/ui/components/input-search';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import {
  UnderlinedTabs,
  UnderlinedTabsList,
  UnderlinedTabsTrigger
} from '@workspace/ui/components/tabs';

import { searchParams } from '~/components/organizations/slug/contents/contents-search-params';
import { useTransitionContext } from '~/hooks/use-transition-context';
import {
  contentTypeFilterValues,
  type ContentTypeFilter,
  type GetContentsSortBy
} from '~/schemas/contents/get-contents-schema';
import { SortDirection } from '~/types/sort-direction';

export function ContentsFilters(): React.JSX.Element {
  const { startTransition } = useTransitionContext();

  const [searchQuery, setSearchQuery] = useQueryState(
    'searchQuery',
    searchParams.searchQuery.withOptions({ startTransition, shallow: false })
  );

  const [type, setType] = useQueryState(
    'type',
    searchParams.type.withOptions({ startTransition, shallow: false })
  );

  const [sortBy, setSortBy] = useQueryState(
    'sortBy',
    searchParams.sortBy.withOptions({ startTransition, shallow: false })
  );

  const [sortDirection, setSortDirection] = useQueryState(
    'sortDirection',
    searchParams.sortDirection.withOptions({ startTransition, shallow: false })
  );

  const [pageIndex, setPageIndex] = useQueryState(
    'pageIndex',
    searchParams.pageIndex.withOptions({ startTransition, shallow: false })
  );

  const resetToFirstPage = () => {
    if (pageIndex !== 0) setPageIndex(0);
  };

  const handleSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target?.value || '';
    if (value !== searchQuery) {
      setSearchQuery(value);
      resetToFirstPage();
    }
  };

  const handleTypeChange = (value: string): void => {
    if (
      value !== type &&
      contentTypeFilterValues.includes(value as ContentTypeFilter)
    ) {
      setType(value as ContentTypeFilter);
      resetToFirstPage();
    }
  };

  const handleSortByChange = (value: string): void => {
    // value debe ser 'title' | 'updatedAt'
    if (value !== sortBy) {
      setSortBy(value as GetContentsSortBy);
      resetToFirstPage();
    }
  };

  const toggleSortDirection = (): void => {
    setSortDirection(
      sortDirection === SortDirection.Asc
        ? SortDirection.Desc
        : SortDirection.Asc
    );
    resetToFirstPage();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <UnderlinedTabs
          value={type}
          onValueChange={handleTypeChange}
          className="-ml-2"
        >
          <UnderlinedTabsList className="h-10 max-h-10 min-h-10 gap-x-1 border-none">
            {typeOptions.map((option) => (
              <UnderlinedTabsTrigger
                key={option.value}
                value={option.value}
                className="mx-0 border-t-4 border-t-transparent"
              >
                <div className="flex flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                  {option.icon}
                  {option.label}
                </div>
              </UnderlinedTabsTrigger>
            ))}
          </UnderlinedTabsList>
        </UnderlinedTabs>

        <Select
          value={sortBy}
          onValueChange={handleSortByChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last modified</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          title={
            sortDirection === SortDirection.Asc ? 'Ascending' : 'Descending'
          }
          onClick={toggleSortDirection}
        >
          {sortDirection === SortDirection.Asc ? (
            <ArrowUpAZ className="size-4" />
          ) : (
            <ArrowDownAZ className="size-4" />
          )}
        </Button>
      </div>
      <div className="ml-auto">
        <InputSearch
          placeholder="Search content by title..."
          className="w-full sm:w-[240px]"
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
      </div>
    </>
  );
}

const typeOptions: Array<{
  label: string;
  value: ContentTypeFilter;
  icon: React.ReactNode;
}> = [
  {
    label: 'All',
    value: 'all',
    icon: <ListIcon className="size-4 shrink-0" />
  },
  {
    label: 'Courses',
    value: 'course',
    icon: <LayoutIcon className="size-4 shrink-0" />
  },
  {
    label: 'Microlearning',
    value: 'microlearning',
    icon: <LayersIcon className="size-4 shrink-0" />
  }
];
