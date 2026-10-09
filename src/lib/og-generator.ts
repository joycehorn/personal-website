import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import type { Locale } from './types';
import { loadContent, t } from './content';
import {
  TIMELINE_START_YEAR,
  TIMELINE_END_YEAR,
  yearToX,
  buildTimelineDataset,
} from './timeline-math';

const LANE_COLORS: Record<string, string> = {
  research: '#1F5E5B',
  education: '#3B4A8C',
  industry: '#A4552C',
  publications: '#1B1A17',
  honors: '#9A7A22',
  service: '#5E6B3A',
};

export async function generateOgImage(locale: Locale): Promise<Buffer> {
  const content = loadContent();
  const headline = t(content.headline, locale);

  const newsreaderFont = fs.readFileSync(
    path.resolve(process.cwd(), 'node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff')
  );
  const ibmSansFont = fs.readFileSync(
    path.resolve(process.cwd(), 'node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff')
  );
  const ibmMonoFont = fs.readFileSync(
    path.resolve(process.cwd(), 'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff')
  );

  const dataset = buildTimelineDataset(content.timeline, content.publications, locale);
  const lanes = content.lanes;

  const SVG_WIDTH = 1040;
  const SVG_HEIGHT = 44;
  const LANE_HEIGHT = 5;
  const LANE_GAP = 2;

  const now = new Date();
  const currentYearDecimal = now.getFullYear() + (now.getMonth() + 0.5) / 12;
  const nowX = yearToX(currentYearDecimal, SVG_WIDTH);

  // Build SVG child elements for mini timeline
  const svgChildren: any[] = [];

  // Lane guidelines
  lanes.forEach((lane, idx) => {
    const y = 6 + idx * (LANE_HEIGHT + LANE_GAP);
    svgChildren.push({
      type: 'line',
      props: {
        x1: '0',
        y1: `${y + LANE_HEIGHT / 2}`,
        x2: `${SVG_WIDTH}`,
        y2: `${y + LANE_HEIGHT / 2}`,
        stroke: '#DDD7CA',
        strokeWidth: '1',
      },
    });
  });

  // Dataset entries
  dataset.forEach((entry) => {
    const laneIndex = lanes.findIndex((l) => l.id === entry.lane);
    if (laneIndex === -1) return;
    const y = 6 + laneIndex * (LANE_HEIGHT + LANE_GAP);
    const color = LANE_COLORS[entry.lane] || '#1B1A17';

    if (entry.isRange) {
      const x1 = yearToX(entry.start, SVG_WIDTH);
      const x2 = yearToX(entry.end, SVG_WIDTH);
      const width = Math.max(4, x2 - x1);

      svgChildren.push({
        type: 'rect',
        props: {
          x: `${x1}`,
          y: `${y}`,
          width: `${width}`,
          height: `${LANE_HEIGHT}`,
          rx: `${LANE_HEIGHT / 2}`,
          fill: color,
        },
      });

      if (entry.endExpected && entry.endExpected > entry.end) {
        svgChildren.push({
          type: 'line',
          props: {
            x1: `${x2}`,
            y1: `${y + LANE_HEIGHT / 2}`,
            x2: `${yearToX(entry.endExpected, SVG_WIDTH)}`,
            y2: `${y + LANE_HEIGHT / 2}`,
            stroke: color,
            strokeWidth: '2',
            strokeDasharray: '3,2',
          },
        });
      }
    } else {
      const cx = yearToX(entry.start, SVG_WIDTH);
      svgChildren.push({
        type: 'circle',
        props: {
          cx: `${cx}`,
          cy: `${y + LANE_HEIGHT / 2}`,
          r: '2.5',
          fill: color,
        },
      });
    }
  });

  // Today indicator
  svgChildren.push({
    type: 'line',
    props: {
      x1: `${nowX}`,
      y1: '2',
      x2: `${nowX}`,
      y2: `${SVG_HEIGHT - 2}`,
      stroke: '#1B1A17',
      strokeWidth: '1.5',
      strokeDasharray: '2,2',
    },
  });

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#F6F3EC',
          padding: '40px 60px',
          border: '1px solid #DDD7CA',
          gap: '32px',
        },
        children: [
          // Header row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'IBM Plex Mono',
                fontSize: '13px',
                color: '#6B675E',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderBottom: '1px solid #DDD7CA',
                paddingBottom: '14px',
              },
              children: [
                { type: 'span', props: { children: 'joycehornfonteles.com' } },
                { type: 'span', props: { children: 'Vanderbilt University · NSF EngageAI Institute' } },
              ],
            },
          },

          // Center identity
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontFamily: 'Newsreader',
                      fontSize: '56px',
                      fontWeight: 400,
                      color: '#1B1A17',
                      margin: 0,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    },
                    children: 'Joyce Horn Fonteles',
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontFamily: 'IBM Plex Sans',
                      fontSize: '20px',
                      color: '#6B675E',
                      lineHeight: 1.45,
                      margin: 0,
                      maxWidth: '960px',
                    },
                    children: headline,
                  },
                },
              ],
            },
          },

          // Bottom mini timeline container
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderTop: '1px solid #DDD7CA',
                paddingTop: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '13px',
                      color: '#6B675E',
                      letterSpacing: '0.05em',
                    },
                    children: [
                      { type: 'span', props: { children: '2002 · 15 YEARS INDUSTRY' } },
                      { type: 'span', props: { children: 'DUAL-CAREER TIMELINE' } },
                      { type: 'span', props: { children: 'PHD DEFENSE · 2027' } },
                    ],
                  },
                },
                {
                  type: 'svg',
                  props: {
                    width: `${SVG_WIDTH}`,
                    height: `${SVG_HEIGHT}`,
                    viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
                    style: { display: 'flex', width: '100%' },
                    children: svgChildren,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Newsreader', data: newsreaderFont, weight: 400, style: 'normal' },
        { name: 'IBM Plex Sans', data: ibmSansFont, weight: 400, style: 'normal' },
        { name: 'IBM Plex Mono', data: ibmMonoFont, weight: 400, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
