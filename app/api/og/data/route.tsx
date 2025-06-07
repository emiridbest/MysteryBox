import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const balance = searchParams.get('balance');
 
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
          src={`${process.env.NEXT_PUBLIC_URL}/mystery-box-og.png`} 
          alt="MysteryBox Logo" 
          width="1200"
          height="630"
          style={{ 
            width: '1200px', 
            height: '630px'
          }} 
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}