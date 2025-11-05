'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';

const inputSchema = z.object({
  contentId: z.string().uuid()
});

export type DeleteContentResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'not_found' | 'forbidden' | 'unknown';
      message?: string;
    };

export const deleteContent = authOrganizationActionClient
  .metadata({ actionName: 'deleteContent' })
  .inputSchema(inputSchema)
  .action<DeleteContentResult>(async ({ parsedInput, ctx }) => {
    const { contentId } = parsedInput;

    try {
      // 1) Asegura que el content pertenece a la organización
      const content = await prisma.content.findFirst({
        where: { id: contentId, organizationId: ctx.organization.id },
        select: { id: true, ownerId: true }
      });

      if (!content) {
        return {
          ok: false,
          reason: 'not_found',
          message: 'Content not found (maybe already deleted).'
        };
      }

      // 2) Autorización: owner O admin de la organización
      const currentUserId = ctx.session.user.id;
      const isOrgAdmin = await isOrganizationAdmin(
        currentUserId,
        ctx.organization.id
      );
      const isOwner = content.ownerId === currentUserId;

      if (!isOwner && !isOrgAdmin) {
        return {
          ok: false,
          reason: 'forbidden',
          message: 'You are not allowed to delete this content.'
        };
      }

      // 3) Delete
      await prisma.content.delete({ where: { id: content.id } });

      // 4) Revalidate cache & ruta
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Contents,
          ctx.organization.id
        )
      );
      if (ctx.organization.slug) {
        revalidatePath(`/organizations/${ctx.organization.slug}/contents`);
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'unknown', message: 'Unexpected error.' };
    }
  });
