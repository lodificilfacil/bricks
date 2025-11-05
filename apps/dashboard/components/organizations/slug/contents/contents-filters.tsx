'use client';

import * as React from 'react';
import { LayersIcon, LayoutIcon, ListIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { InputSearch } from '@workspace/ui/components/input-search';
import {
  UnderlinedTabs,
  UnderlinedTabsList,
  UnderlinedTabsTrigger
} from '@workspace/ui/components/tabs';

import { searchParams } from '~/components/organizations/slug/contents/contents-search-params';
import { useTransitionContext } from '~/hooks/use-transition-context';
import {
  contentTypeFilterValues,
  type ContentTypeFilter
} from '~/schemas/contents/get-contents-schema';

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

  const [pageIndex, setPageIndex] = useQueryState(
    'pageIndex',
    searchParams.pageIndex.withOptions({ startTransition, shallow: false })
  );

  const handleSearchQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target?.value || '';
    if (value !== searchQuery) {
      setSearchQuery(value);
      if (pageIndex !== 0) setPageIndex(0);
    }
  };

  const handleTypeChange = (value: string): void => {
    if (
      value !== type &&
      contentTypeFilterValues.includes(value as ContentTypeFilter)
    ) {
      setType(value as ContentTypeFilter);
      if (pageIndex !== 0) setPageIndex(0);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <InputSearch
        placeholder="Search content by title..."
        className="w-full sm:w-[240px]"
        value={searchQuery}
        onChange={handleSearchQueryChange}
      />

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
    </div>
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
