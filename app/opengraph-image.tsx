import { ImageResponse } from 'next/og';
import { generate } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const revalidate = false;

export default function Image() {
  return new ImageResponse(
    generate({
      title: 'Master Power BI. Build smarter with AI.',
      description:
        'Learn DAX, Power Query, Data Modeling, Microsoft Fabric, and AI-assisted Power BI development.',
      site: appName,
      primaryColor: 'rgba(121, 84, 222, 0.3)',
      primaryTextColor: 'rgb(173, 148, 255)',
    }),
    {
      width: 1200,
      height: 630,
    },
  );
}
