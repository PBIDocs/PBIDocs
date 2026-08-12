import { tutorials } from 'collections/server';
import { tutorialsImageRoute } from './shared';

function toSlug(path: string): string {
  return path.replace(/\.mdx$/, '');
}

export function getTutorialImageUrl(slug: string): string {
  return `${tutorialsImageRoute}/${slug}/image.png`;
}

export function getTutorials() {
  return [...tutorials]
    .map((tutorial) => ({ ...tutorial, slug: toSlug(tutorial.info.path) }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getTutorial(slug: string) {
  return getTutorials().find((tutorial) => tutorial.slug === slug);
}

export type Tutorial = ReturnType<typeof getTutorials>[number];
