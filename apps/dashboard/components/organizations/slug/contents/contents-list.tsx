import * as React from 'react';

import { ScrollArea } from '@workspace/ui/components/scroll-area';

import { ContentCardDto } from '~/types/dtos/content-dto';
import { ContentCard } from './content-card';

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
          <ContentCard
            key={content.id}
            content={content}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
