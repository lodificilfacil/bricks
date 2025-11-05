import { z } from 'zod';

import { SortDirection } from '~/types/sort-direction';

export const contentTypeFilterValues = [
  'all',
  'course',
  'microlearning'
] as const;
export type ContentTypeFilter = (typeof contentTypeFilterValues)[number];

export const getContentsSortByValues = ['title', 'updatedAt'] as const;
export type GetContentsSortBy = (typeof getContentsSortByValues)[number];

export const getContentsSchema = z.object({
  pageIndex: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(24),
  type: z.enum(contentTypeFilterValues).default('all'),
  sortBy: z.enum(getContentsSortByValues).default('updatedAt'),
  sortDirection: z.nativeEnum(SortDirection).default(SortDirection.Desc),
  searchQuery: z.string().trim().default('')
});

export type GetContentsSchema = z.infer<typeof getContentsSchema>;
