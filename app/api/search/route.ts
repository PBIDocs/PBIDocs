import { source } from '@/lib/source';
import { getBlogPosts } from '@/lib/blog-source';
import { getTutorials } from '@/lib/tutorial-source';
import { createSearchAPI } from 'fumadocs-core/search/server';
import type { AdvancedIndex } from 'fumadocs-core/search/server';

export const revalidate = false; // prevents dynamic server-rendering during export

async function resolveStructuredData(data: unknown) {
  return typeof data === 'function' ? await (data as () => Promise<unknown>)() : data;
}

async function buildIndexes(): Promise<AdvancedIndex[]> {
  const docsIndexes = await Promise.all(
    source.getPages().map(async (page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: (await resolveStructuredData(page.data.structuredData)) as AdvancedIndex['structuredData'],
    })),
  );

  const blogIndexes = await Promise.all(
    getBlogPosts().map(async (post) => ({
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      id: `/blog/${post.slug}`,
      structuredData: (await resolveStructuredData(post.structuredData)) as AdvancedIndex['structuredData'],
    })),
  );

  const tutorialIndexes = await Promise.all(
    getTutorials().map(async (tutorial) => ({
      title: tutorial.title,
      description: tutorial.description,
      url: `/tutorials/${tutorial.slug}`,
      id: `/tutorials/${tutorial.slug}`,
      structuredData: (await resolveStructuredData(
        tutorial.structuredData,
      )) as AdvancedIndex['structuredData'],
    })),
  );

  return [...docsIndexes, ...blogIndexes, ...tutorialIndexes];
}

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: buildIndexes,
});
