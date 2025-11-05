import * as React from 'react';
import { LayersIcon } from 'lucide-react';

import { EmptyState } from '@workspace/ui/components/empty-state';

export function ContentsEmptyState(): React.JSX.Element {
  return (
    <div className="p-6">
      <EmptyState
        icon={
          <div className="flex size-12 items-center justify-center rounded-md border">
            <LayersIcon className="size-6 shrink-0 text-muted-foreground" />
          </div>
        }
        title="No content yet"
        description="Create your first course or a microlearning."
      ></EmptyState>
    </div>
  );
}
