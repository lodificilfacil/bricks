import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral
} from 'nuqs/server';

import {
  contentTypeFilterValues,
  getContentsSortByValues
} from '~/schemas/contents/get-contents-schema';
import { SortDirection } from '~/types/sort-direction';

export const searchParams = {
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(9),
  type: parseAsStringLiteral([...contentTypeFilterValues]).withDefault('all'),
  sortBy: parseAsStringLiteral([...getContentsSortByValues]).withDefault(
    'updatedAt'
  ),
  sortDirection: parseAsStringLiteral(Object.values(SortDirection)).withDefault(
    SortDirection.Desc
  ),
  searchQuery: parseAsString.withDefault('')
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serializer = createSerializer(searchParams);
