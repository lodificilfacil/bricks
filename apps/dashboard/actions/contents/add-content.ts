'use server';

import { revalidateTag } from 'next/cache';

import { createContentAndCaptureEvent } from '~/actions/contents/_content-event-capture';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { addContentSchema } from '~/schemas/contents/add-content-schema';

export const addContent = authOrganizationActionClient
  .metadata({ actionName: 'addContent' })
  .inputSchema(addContentSchema)
  .action(async ({ parsedInput, ctx }) => {
    await createContentAndCaptureEvent(
      {
        title: parsedInput.title,
        type: parsedInput.type,
        folderId: parsedInput.folderId ?? null,
        organization: {
          connect: {
            id: ctx.organization.id
          }
        },
        owner: {
          connect: {
            id: ctx.session.user.id
          }
        }
      },
      ctx.session.user.id
    );

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contents,
        ctx.organization.id
      )
    );

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createOrganizationTag(
          OrganizationCacheKey.Favorites,
          ctx.organization.id,
          membership.userId
        )
      );
    }
  });
