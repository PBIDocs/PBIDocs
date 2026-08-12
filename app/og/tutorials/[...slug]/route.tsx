import { getTutorial, getTutorials } from '@/lib/tutorial-source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { generate as DefaultImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/tutorials/[...slug]'>) {
  const { slug } = await params;
  const tutorial = getTutorial(slug.slice(0, -1).join('/'));
  if (!tutorial) notFound();

  return new ImageResponse(
    <DefaultImage title={tutorial.title} description={tutorial.description} site={appName} />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return getTutorials().map((tutorial) => ({
    slug: [tutorial.slug, 'image.png'],
  }));
}
