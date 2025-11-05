'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';

const inputSchema = z.object({
  contentId: z.string().uuid()
});

export const duplicateContent = authOrganizationActionClient
  .metadata({ actionName: 'duplicateContent' })
  .inputSchema(inputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { contentId } = parsedInput;

    try {
      const src = await prisma.content.findFirst({
        where: { id: contentId, organizationId: ctx.organization.id },
        select: {
          id: true,
          title: true,
          type: true,
          folderId: true
        }
      });

      if (!src) {
        return {
          ok: false as const,
          reason: 'not_found' as const,
          message: 'Content not found.'
        };
      }

      const newTitleBase =
        (src.title && src.title.trim().length > 0 ? src.title.trim() : '') +
        ' (copy)';

      const duplicated = await prisma.content.create({
        data: {
          title: newTitleBase,
          type: src.type,
          ownerId: ctx.session.user.id,
          organizationId: ctx.organization.id,
          folderId: src.folderId ?? null
        },
        select: { id: true }
      });

      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contents,
          ctx.organization.id
        )
      );

      return { ok: true as const, newId: duplicated.id };
    } catch (err) {
      console.error('duplicateContent failed:', err);
      return {
        ok: false as const,
        reason: 'error' as const,
        message: 'Unexpected error duplicating the content.'
      };
    }
  });
