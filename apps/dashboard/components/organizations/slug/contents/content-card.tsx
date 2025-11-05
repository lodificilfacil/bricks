'use client';

import * as React from 'react';
import {
  CalendarIcon,
  LayersIcon,
  LayoutIcon,
  MoreHorizontalIcon,
  Trash2Icon
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';

import { deleteContent } from '~/actions/contents/delete-content';
import { ContentCardDto } from '~/types/dtos/content-dto';

interface ContentsListProps {
  content: ContentCardDto;
  currentUserId?: string;
  isOrgAdmin?: boolean;
}

export function ContentCard({
  content,
  currentUserId,
  isOrgAdmin
}: ContentsListProps): React.JSX.Element {
  const [pending, startTransition] = React.useTransition();

  const canDelete = !!(isOrgAdmin || content.owner.id === currentUserId);

  const typeLabel = content.type === 'course' ? 'Course' : 'Microlearning';
  const typeBadgeClass =
    content.type === 'course'
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-muted text-foreground border-border';

  const handleDelete = (): void => {
    if (!canDelete) {
      toast.error('You are not allowed to delete this content.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteContent({ contentId: content.id });

        if (!res) {
          toast.error('Unexpected response.');
          return;
        }

        if (res.serverError) {
          toast.error(res.serverError || 'Could not delete content.');
          return;
        }

        if (res.validationErrors) {
          toast.error('Invalid request.');
          return;
        }

        const payload = res.data;

        if (payload?.ok) {
          toast.success('Content deleted');
          return;
        }

        switch (payload?.reason) {
          case 'not_found':
            toast.error(
              payload.message ?? 'Content not found (maybe already deleted).'
            );
            break;
          case 'forbidden':
            toast.error(
              payload.message ?? 'You are not allowed to delete this content.'
            );
            break;
          default:
            toast.error(payload?.message ?? 'Could not delete content.');
            break;
        }
      } catch (e) {
        toast.error('Could not delete content.');
      }
    });
  };

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            {content.type === 'course' ? (
              <LayoutIcon className="size-4 text-muted-foreground" />
            ) : (
              <LayersIcon className="size-4 text-muted-foreground" />
            )}
            <span className="truncate">{content.title || 'Untitled'}</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={`mt-2 h-6 rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass}`}
          >
            {typeLabel}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1.5 hover:bg-accent focus:outline-none"
              aria-label="Open menu"
              disabled={pending}
            >
              <MoreHorizontalIcon className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canDelete && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={pending}
                className="cursor-pointer"
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            {content.owner?.image && <AvatarImage src={content.owner.image} />}
            <AvatarFallback>
              {content.owner?.name?.slice(0, 2).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <span>{content.owner.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <time
            dateTime={content.updatedAt}
            suppressHydrationWarning
          >
            {new Date(content.updatedAt).toLocaleDateString()}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}
