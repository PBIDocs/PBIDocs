import { toolImage, toolImageSize } from '@/lib/tool-og-image';

export const size = toolImageSize;
export const contentType = 'image/png';
export const alt = 'PBIDocs tool preview';
export const revalidate = false;

export default function Image() {
  return toolImage('/tools/weibull-analysis');
}
