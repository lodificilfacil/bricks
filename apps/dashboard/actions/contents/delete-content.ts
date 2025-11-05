// apps/dashboard/actions/contents/delete-content.ts
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

// ⬇️ Ajusta esta ruta si tu helper vive en otro sitio
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ActionType, ActorType, Prisma } from '@workspace/database';
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

    // 1) Encontrar el contenido dentro de esta organización
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        organizationId: ctx.organization.id
      },
      select: { id: true, ownerId: true }
    });

    if (!content) {
      // No existe o pertenece a otra organización
      return;
    }

    // 2) Comprobar permisos en servidor (RBAC real)
    const currentUserId = ctx.session.user.id;
    const isOrgAdmin = await isOrganizationAdmin(
      currentUserId,
      ctx.organization.id
    );
    const isOwner = content.ownerId === currentUserId;

    if (!isOwner && !isOrgAdmin) {
      // Sin permisos para borrar
      return;
    }

    // 3) Borrado + registro de actividad en transacción
    await prisma.$transaction(async (tx) => {
      await tx.content.delete({ where: { id: content.id } });

      await tx.contentActivity.create({
        data: {
          contentId: content.id,
          actionType: ActionType.DELETE,
          actorId: currentUserId,
          actorType: ActorType.MEMBER,
          metadata: Prisma.DbNull, // ✅ no uses null directo
          occurredAt: new Date()
        }
      });
    });

    // 4) Revalidar cache del listado de contenidos
    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.Contents,
        ctx.organization.id
      )
    );
  });
