import { Providers } from "../app/providers";
import { getSession } from "../lib/auth";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";
import "../styles/animations.css";
import { Metadata } from "next";
import { Toaster } from "../components/ui/sonner";


const appUrl = process.env.NEXT_PUBLIC_URL
export const metadata: Metadata = {
  title: 'Mystery Box ',
  description: 'Open to receive a surprise gift! 🎁',
  metadataBase: new URL(appUrl),
  openGraph: {
    images: ['/api/og/data'],
    title: 'Mystery Box',
    description: 'Open to receive a surprise gift! 🎁',
    type: 'website',
  },
  // Add Farcaster frame meta tag for mini app embedding
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/api/og/data`,
      button: {
        title: "🎁 Mystery Box",
        action: {
          type: "launch_frame",
          name: "Mystery Box",
          url: appUrl,
          // Configure the native Farcaster splash screen
          splashImageUrl: `${appUrl}/mystery-box-og.svg`,
          splashBackgroundColor: "#f5f0ec",
          webhookUrl: `${appUrl}/api/farcaster/webhook`,
        }
      }
    })
  }
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Providers session={session}>
                <Header />
                    {children}
                        <Toaster />
                <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}