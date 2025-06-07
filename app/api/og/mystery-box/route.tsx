import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { z } from "zod";

// Define schema for query parameters
const schema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  username: z.string().optional(),
});

// Function to create a share image
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Validate and parse query parameters
    const result = schema.safeParse({
      amount: searchParams.get('amount'),
      username: searchParams.get('username'),
    });
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters" },
        { status: 400 }
      );
    }
    
    const { amount, username } = result.data;
    
    // Create the share image
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to right, #9333EA, #4F46E5)',
            position: 'relative',
          }}
        >
          {/* Background sparkle effects */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 215, 0, 0.3)',
              filter: 'blur(40px)',
            }}
          />
          
          {/* Logo/Icon */}
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            🎁
          </div>
          
          {/* Main text */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            Mystery Box
          </h1>
          
          {/* Amount claimed */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '20px 50px',
              marginBottom: '40px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <p
              style={{
                fontSize: '32px',
                color: 'white',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              {username ? `${username} claimed` : 'I claimed'}
            </p>
            <h2
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#FFD700',
                margin: '0',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              {amount} celoUSD
            </h2>
          </div>
          
          {/* Call to action */}
          <p
            style={{
              fontSize: '32px',
              color: 'white',
              marginTop: '20px',
              textAlign: 'center',
            }}
          >
            Try your luck and claim free celoUSD!
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating share image:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
