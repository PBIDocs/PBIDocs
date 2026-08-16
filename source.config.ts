import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { pbidocsLightTheme, pbidocsDarkTheme } from './lib/shiki-theme';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const faqSchema = z
  .array(z.object({ question: z.string(), answer: z.string() }))
  .optional();

export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    faq: faqSchema,
  }),
});

export const tutorials = defineCollections({
  type: 'doc',
  dir: 'content/tutorials',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional(),
    faq: faqSchema,
  }),
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: pbidocsLightTheme,
        dark: pbidocsDarkTheme,
      },
      addLanguageClass: true,
    },
  },
});
