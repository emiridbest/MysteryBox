import { NextRequest, NextResponse } from 'next/server';

interface NotificationRequest {
  title: string;
  body: string;
  targetUrl: string;
  tokens: string[];
}

// to be stored in DB
const TOKEN_URL_MAP = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication 
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.NOTIFICATION_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data: NotificationRequest = await request.json();
    const { title, body, targetUrl, tokens } = data;
    
    // Validate required fields
    if (!title || !body || !targetUrl || !tokens || tokens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate a unique notification ID
    const notificationId = `esusu-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Process each token 
    const results = await Promise.all(
      tokens.map(async (token) => {
        try {
          // get this URL from your database
          const notificationUrl = TOKEN_URL_MAP.get(token) || 'https://api.warpcast.com/v1/frame-notifications';
          
          // Send notification to the Farcaster client
          const response = await fetch(notificationUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notificationId,
              title,
              body,
              targetUrl,
              tokens: [token]
            })
          });
          
          if (!response.ok) {
            throw new Error(`Failed to send notification: ${response.status}`);
          }
          
          const result = await response.json();
          
          // Process the result
          if (result.successfulTokens?.includes(token)) {
            return { token, status: 'success' };
          } else if (result.invalidTokens?.includes(token)) {
            //  remove this token from your database
            TOKEN_URL_MAP.delete(token);
            return { token, status: 'invalid' };
          } else if (result.rateLimitedTokens?.includes(token)) {
            return { token, status: 'rate-limited' };
          } else {
            return { token, status: 'failed' };
          }
        } catch (error) {
          console.error(`Error sending notification for token ${token}:`, error);
          return { token, status: 'error', error };
        }
      })
    );
    
    // Summarize results
    const successfulTokens = results.filter(r => r.status === 'success').map(r => r.token);
    const invalidTokens = results.filter(r => r.status === 'invalid').map(r => r.token);
    const rateLimitedTokens = results.filter(r => r.status === 'rate-limited').map(r => r.token);
    const failedTokens = results.filter(r => r.status === 'failed' || r.status === 'error').map(r => r.token);
    
    return NextResponse.json({
      success: true,
      results: {
        successful: successfulTokens.length,
        invalid: invalidTokens.length,
        rateLimited: rateLimitedTokens.length,
        failed: failedTokens.length
      },
      successfulTokens,
      invalidTokens,
      rateLimitedTokens,
      failedTokens
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
