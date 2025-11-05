import * as React from 'react';
import { type Metadata } from 'next';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar
} from '@workspace/ui/components/page';

import { ContentsEmptyState } from '~/components/organizations/slug/contents/contents-empty-state';
import { ContentsFilters } from '~/components/organizations/slug/contents/contents-filters';
import { ContentsList } from '~/components/organizations/slug/contents/contents-list';
import { searchParamsCache } from '~/components/organizations/slug/contents/contents-search-params';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { getContents } from '~/data/contents/get-contents';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Contents')
};

export default async function ContentsPage({
  searchParams
}: NextPageProps): Promise<React.JSX.Element> {
  const parsedSearchParams = await searchParamsCache.parse(searchParams);

  const { contents, totalCount } = await getContents(parsedSearchParams);

  const hasAnyContents = totalCount > 0;

  const ctx = await getAuthOrganizationContext();
  const isOrgAdmin = await isOrganizationAdmin(
    ctx.session.user.id,
    ctx.organization.id
  );
  const currentUserId = ctx.session.user.id;

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Contents"
              info={`${totalCount} ${totalCount === 1 ? 'content' : 'contents'} in your organization`}
            />
          </PagePrimaryBar>
          <PageSecondaryBar>
            <React.Suspense>
              <ContentsFilters />
            </React.Suspense>
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          {hasAnyContents ? (
            <React.Suspense>
              <ContentsList
                contents={contents}
                currentUserId={currentUserId}
                isOrgAdmin={isOrgAdmin}
              />
            </React.Suspense>
          ) : (
            <ContentsEmptyState />
          )}
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
