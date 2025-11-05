import * as React from 'react';
import { CalendarIcon, LayersIcon, LayoutIcon } from 'lucide-react';

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

import { ContentCardDto } from '~/types/dtos/content-dto';

interface ContentsListProps {
  content: ContentCardDto;
}

export function ContentCard({ content }: ContentsListProps): React.JSX.Element {
  // UI labels per type
  const typeLabel = content.type === 'course' ? 'Course' : 'Microlearning';

  // Badge styles per type (tweak to your design system)
  const typeBadgeClass =
    content.type === 'course'
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-muted text-foreground border-border';

  return (
    <Card
      key={content.id}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {content.type === 'course' ? (
            <LayersIcon className="size-4 text-muted-foreground" />
          ) : (
            <LayoutIcon className="size-4 text-muted-foreground" />
          )}
          {content.title || 'Untitled'}
        </CardTitle>
        <Badge
          variant="outline"
          className={`h-6 rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass}`}
        >
          {typeLabel}
        </Badge>
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
