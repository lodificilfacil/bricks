import {
  ActionType,
  ActorType,
  type Content,
  type Prisma
} from '@workspace/database';
import { prisma } from '@workspace/database/client';

const fieldsToCheck = ['title', 'type', 'organizationId', 'folderId'] as const;

type FieldToCheck = (typeof fieldsToCheck)[number];

type ChangeEntry = {
  old: string | null;
  new: string | null;
};

type ContentChanges = {
  [K in FieldToCheck]?: ChangeEntry;
};

function safeStringify<T>(value: T): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function detectContentChanges(
  current: Partial<Content> | null,
  updated: Content,
  updateData?: Prisma.ContentUpdateInput
): ContentChanges {
  const changes: ContentChanges = {};

  for (const field of fieldsToCheck) {
    const oldValue = current ? safeStringify(current[field]) : null;
    const newValue = safeStringify(updated[field]);
    if (oldValue !== newValue && (!updateData || field in updateData)) {
      changes[field] = { old: oldValue, new: newValue };
    }
  }

  return changes;
}

export async function createContentAndCaptureEvent(
  contentData: Prisma.ContentCreateInput,
  actorId: string
): Promise<Content> {
  return prisma.$transaction(async (tx) => {
    const createdAt = contentData.createdAt ?? new Date();

    const newContent = await tx.content.create({
      data: {
        ...contentData,
        createdAt,
        updatedAt: createdAt
      }
    });

    const changes = detectContentChanges(null, newContent);

    await tx.contentActivity.create({
      data: {
        contentId: newContent.id,
        actionType: ActionType.CREATE,
        actorId,
        actorType: ActorType.MEMBER,
        metadata: changes,
        occurredAt: createdAt
      }
    });

    return newContent;
  });
}
