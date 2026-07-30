import { source } from '@/lib/source'; // double-check if your source file is in @/lib/source or @/app/source
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false; // prevents dynamic server-rendering during export
export const { staticGET: GET } = createFromSource(source);