import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { getBlogPosts } from '@/lib/blog-source';
import { getTutorials } from '@/lib/tutorial-source';

export const dynamic = 'force-static';

const baseUrl = 'https://pbidocs.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
  }));

  const posts = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const tutorials = getTutorials().map((tutorial) => ({
    url: `${baseUrl}/tutorials/${tutorial.slug}`,
    lastModified: new Date(tutorial.date),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/changelog`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/tutorials`, lastModified: new Date() },
    ...docs,
    ...posts,
    ...tutorials,
  ];
}
