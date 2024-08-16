import { ImageResponse } from 'next/og'

import {
  CUSTOM_DARK,
  CUSTOM_LIGHT,
  DANGER,
  SUCCESS,
} from '@/config/constants/colors'
import { APP_NAME, APP_TITLE } from '@/config/constants/main'

export const runtime = 'edge'

export async function GET() {
  const fontData = await fetch(
    new URL('../../fonts/FracktifSemiBold/DEMO-font.otf', import.meta.url),
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '-.02em',
          fontWeight: 600,
          fontFamily: 'FracktifSemiBold',
          background: CUSTOM_LIGHT,
        }}
      >
        <div
          style={{
            left: 42,
            top: 42,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              // background: CUSTOM_DARK,
              background: `linear-gradient(to bottom, ${SUCCESS}, ${DANGER})`,
              borderRadius: 6,
            }}
          />
          <span
            style={{
              marginLeft: 8,
              fontSize: 20,
            }}
          >
            {APP_NAME.SHORT}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '30px 60px',
            margin: '0 42px',
            fontSize: 44,
            width: 'auto',
            maxWidth: 550,
            textAlign: 'center',
            backgroundColor: CUSTOM_DARK,
            color: CUSTOM_LIGHT,
            lineHeight: 1.4,
            borderRadius: 12,
          }}
        >
          Start {APP_TITLE}.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'FracktifSemiBold',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  )
}
