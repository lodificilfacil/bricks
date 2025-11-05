import 'server-only';

import { unstable_cache as cache } from 'next/cache';
import { Prisma } from '@prisma/client'; // ← usa Prisma oficial

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { ValidationError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';
import {
  getContentsSchema,
  type GetContentsSchema
} from '~/schemas/contents/get-contents-schema';

export async function getContents(input: GetContentsSchema): Promise<{
  contents: {
    id: string;
    title: string;
    type: 'course' | 'microlearning';
    updatedAt: string;
    owner: { id: string; name: string; image: string | null };
  }[];
  filteredCount: number;
  totalCount: number;
}> {
  const ctx = await getAuthOrganizationContext();

  const result = getContentsSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(JSON.stringify(result.error.flatten()));
  }

  const parsedInput = result.data;

  return cache(
    async () => {
      const whereClause = {
        organizationId: ctx.organization.id,
        title: parsedInput.searchQuery
          ? {
              contains: parsedInput.searchQuery,
              mode: Prisma.QueryMode.insensitive
            }
          : undefined,
        type: parsedInput.type !== 'all' ? parsedInput.type : undefined
      };

      const [items, filteredCount, totalCount] = await prisma.$transaction([
        prisma.content.findMany({
          skip: parsedInput.pageIndex * parsedInput.pageSize,
          take: parsedInput.pageSize,
          where: whereClause,
          orderBy: {
            [parsedInput.sortBy]: parsedInput.sortDirection
          },
          select: {
            id: true,
            title: true,
            type: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }),
        prisma.content.count({ where: whereClause }),
        prisma.content.count({
          where: { organizationId: ctx.organization.id }
        })
      ]);

      const mapped = items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString()
      }));

      return { contents: mapped, filteredCount, totalCount };
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.Contents,
      ctx.organization.id,
      parsedInput.pageIndex.toString(),
      parsedInput.pageSize.toString(),
      parsedInput.sortBy,
      parsedInput.sortDirection,
      parsedInput.type,
      parsedInput.searchQuery
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contents,
          ctx.organization.id
        )
      ]
    }
  )();
}
