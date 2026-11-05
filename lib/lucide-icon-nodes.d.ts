// Lucide's per-icon modules export the raw SVG shape data alongside the
// (client-only) component. The tool share images import that data directly,
// since they render on the server where the components can't run.
declare module 'lucide-react/dist/esm/icons/*.mjs' {
  export const __iconNode: [string, Record<string, string>][];
}
