import * as React from 'react';
import { CalendarIcon, LayersIcon, LayoutIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@workspace/ui/components/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

import { useActiveOrganization } from '~/hooks/use-active-organization';

export type ContentCardDto = {
  id: string;
  title: string;
  type: 'course' | 'microlearning';
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    image?: string | null;
  };
};

interface ContentsListProps {
  contents: ContentCardDto[];
  totalCount?: number;
}

export function ContentsList({
  contents
}: ContentsListProps): React.JSX.Element {
  return (
    <ScrollArea className="h-full p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
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
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  {content.owner?.image && (
                    <AvatarImage src={content.owner.image} />
                  )}
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
        ))}
      </div>
    </ScrollArea>
  );
}
