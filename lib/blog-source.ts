import { blog } from 'collections/server';
import { blogImageRoute } from './shared';

function toSlug(path: string): string {
  return path.replace(/\.mdx$/, '');
}

export function getBlogPostImageUrl(slug: string): string {
  return `${blogImageRoute}/${slug}/image.png`;
}

export function getBlogPosts() {
  return [...blog]
    .map((post) => ({ ...post, slug: toSlug(post.info.path) }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getBlogPost(slug: string) {
  return getBlogPosts().find((post) => post.slug === slug);
}

export type BlogPost = ReturnType<typeof getBlogPosts>[number];
