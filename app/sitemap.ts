import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

const baseUrl = 'https://pbidocs.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/changelog`, lastModified: new Date() },
    ...docs,
  ];
}
