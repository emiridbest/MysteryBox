import { NextRequest, NextResponse } from 'next/server';

// This is a simplified webhook handler
// In a real application, you would validate the signature and store data in a database
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received webhook:', data);
    
    // Extract the event type and payload
    const eventType = data.payload?.event;
    
    switch (eventType) {
      case 'frame_added':
        // Handle when a user adds the mini app
        const addToken = data.payload?.notificationDetails?.token;
        const addUrl = data.payload?.notificationDetails?.url;
        console.log(`User added mini app - Token: ${addToken}, URL: ${addUrl}`);
        
        // Here you would store the token and URL in your database
        // associated with the user's FID
        break;
        
      case 'frame_removed':
        // Handle when a user removes the mini app
        console.log('User removed mini app');
        
        // Here you would remove the token from your database
        break;
        
      case 'notifications_enabled':
        // Handle when a user enables notifications
        const enableToken = data.payload?.notificationDetails?.token;
        const enableUrl = data.payload?.notificationDetails?.url;
        console.log(`User enabled notifications - Token: ${enableToken}, URL: ${enableUrl}`);
        
        // Here you would update your database to mark notifications as enabled
        break;
        
      case 'notifications_disabled':
        // Handle when a user disables notifications
        console.log('User disabled notifications');
        
        // Here you would update your database to mark notifications as disabled
        break;
        
      default:
        console.log(`Unknown event type: ${eventType}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
