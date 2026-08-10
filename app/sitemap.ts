import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { getBlogPosts } from '@/lib/blog-source';

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

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/changelog`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    ...docs,
    ...posts,
  ];
}
