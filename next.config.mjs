import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export', // <--- ADD THIS LINE
  agentRules: false,
  // Static export has no server to run next/image's on-demand optimization
  // API through. fumadocs-mdx's built-in remark-image plugin already
  // resolves local images (relative to the .mdx file, or absolute paths
  // under /public) into real static imports with width/height inferred
  // from the file at build time, so next/image still renders correctly --
  // this just skips the resize/reformat step that has nowhere to run.
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
