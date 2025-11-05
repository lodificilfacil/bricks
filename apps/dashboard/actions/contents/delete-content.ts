'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';

const inputSchema = z.object({
  contentId: z.string().uuid()
});

export const deleteContent = authOrganizationActionClient
  .metadata({ actionName: 'deleteContent' })
  .inputSchema(inputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { contentId } = parsedInput;

    // 1) Ensure content belongs to this org and get owner
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        organizationId: ctx.organization.id
      },
      select: { id: true, ownerId: true }
    });

    // If not found (different org or already deleted), exit silently
    if (!content) return;

    // 2) Authorization: owner OR org admin
    const currentUserId = ctx.session.user.id;
    const isOrgAdmin = await isOrganizationAdmin(
      currentUserId,
      ctx.organization.id
    );
    const isOwner = content.ownerId === currentUserId;

    if (!isOwner && !isOrgAdmin) {
      // Not authorized — exit silently
      return;
    }

    // 3) Delete content
    await prisma.content.delete({ where: { id: content.id } });

    // 4) Revalidate caches / route
    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contents,
        ctx.organization.id
      )
    );
  });
