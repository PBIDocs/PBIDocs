import { getBlogPost, getBlogPosts } from '@/lib/blog-source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/blog/[...slug]'>) {
  const { slug } = await params;
  const post = getBlogPost(slug.slice(0, -1).join('/'));
  if (!post) notFound();

  return new ImageResponse(
    <DefaultImage title={post.title} description={post.description} site={appName} />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({
    slug: [post.slug, 'image.png'],
  }));
}
