import { getBlogPosts } from '@/lib/blog-source';
import { getTutorials } from '@/lib/tutorial-source';
import { appName } from '@/lib/shared';

export const revalidate = false;

const baseUrl = 'https://pbidocs.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const entries = [
    ...getBlogPosts().map((post) => ({
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      url: `${baseUrl}/blog/${post.slug}`,
    })),
    ...getTutorials().map((tutorial) => ({
      title: tutorial.title,
      description: tutorial.description,
      date: tutorial.date,
      tags: [...(tutorial.tags ?? []), 'Tutorial'],
      url: `${baseUrl}/tutorials/${tutorial.slug}`,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${entry.url}</link>
      <guid>${entry.url}</guid>
      <description>${escapeXml(entry.description)}</description>
      <pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>
      ${(entry.tags ?? []).map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${appName} Blog & Tutorials</title>
    <link>${baseUrl}/blog</link>
    <description>Practical fixes, cheat sheets, and end-to-end tutorials for Power BI, DAX, and Power Query.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
