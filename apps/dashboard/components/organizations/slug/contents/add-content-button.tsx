import * as React from 'react';

import { ContentType } from '@workspace/database';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';

import { addContent } from '~/actions/contents/add-content';

type Props = {
  organizationId: string;
  folderId: string | null;
};

export function AddContentButton({ organizationId, folderId }: Props) {
  const [pending, startTransition] = React.useTransition();

  const handleCreate = (type: ContentType) => {
    startTransition(async () => {
      await addContent({
        type,
        title: '',
        folderId,
        organizationId
      });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="w-full"
          disabled={pending}
        >
          Add content
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            handleCreate('course');
          }}
        >
          Course
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            handleCreate('microlearning');
          }}
        >
          Microlearning
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
