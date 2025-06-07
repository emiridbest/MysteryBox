import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const balance = searchParams.get('balance') || '12,500';
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF6B9D',
          background: 'linear-gradient(45deg, #FF6B9D, #4ECDC4, #45B7D1)',
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 900, color: 'white' }}>
          🎁 MYSTERY BOX 🎁
        </div>
        <div style={{ fontSize: 30, color: 'white', marginTop: 20 }}>
          Win from {balance} celoUSD!
        </div>
        <div style={{ fontSize: 24, color: 'white', marginTop: 10 }}>
          ✨ TAP TO WIN BIG! ✨
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}