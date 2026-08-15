# PBIDocs

**[pbidocs.com](https://pbidocs.com)** — Power BI documentation, tutorials, and blog posts covering DAX, Power Query, data modeling, Microsoft Fabric, and AI-assisted Power BI development.

## What's here

- **[Docs](https://pbidocs.com/docs)** — 80+ reference pages across DAX (including a full function reference), Power Query (including an M function reference), data modeling, Microsoft Fabric, the Power BI Service, visuals, governance, and AI-assisted workflows.
- **[Tutorials](https://pbidocs.com/tutorials)** — end-to-end walkthroughs, building one real thing from a messy raw dataset through to a finished report.
- **[Blog](https://pbidocs.com/blog)** — practical fixes for specific errors ("column contains a duplicate value," "the key didn't match any rows"), plus cheat sheets that don't fit the reference docs.

Content is written in MDX, lives entirely in [`content/`](./content), and every page includes syntax-highlighted DAX/M/Power Query code, ASCII diagrams for concepts and layouts, and cross-links between related pages.

## Contributing

Found an error, an outdated screenshot, or a gap in the docs? Issues and PRs are welcome:

- **Something's wrong on a page** — every docs page has a "Report an issue" link at the bottom that opens a pre-filled GitHub issue.
- **Want to fix it yourself** — every docs page also has an "Edit this page" link pointing straight at the source file.
- **Bigger changes** (new pages, restructuring) — open an issue first so we're aligned on scope before you put in the work.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, static export)
- [Fumadocs](https://fumadocs.dev) for the docs collection, search, and MDX pipeline
- [Tailwind CSS](https://tailwindcss.com)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com), with a [D1](https://developers.cloudflare.com/d1/) database backing the newsletter signup and page feedback widget

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

| Path | Description |
|---|---|
| `content/docs/` | Reference documentation, one folder per topic area, each with a `meta.json` controlling nav order. |
| `content/blog/` | Blog posts — flat MDX collection, no nested structure. |
| `content/tutorials/` | End-to-end tutorials — same flat-collection pattern as the blog. |
| `app/docs/[[...slug]]/` | Docs page renderer. |
| `app/(home)/blog/`, `app/(home)/tutorials/` | Blog and tutorial listing/detail pages. |
| `lib/source.ts`, `lib/blog-source.ts`, `lib/tutorial-source.ts` | Content source adapters for each collection. |
| `source.config.ts` | Fumadocs MDX collection definitions and frontmatter schemas. |
| `functions/api/` | Cloudflare Pages Functions backing the newsletter signup and feedback widget. |

## License

No license has been set yet — all rights reserved by default. If you'd like to reuse content or code from this repo, open an issue.
