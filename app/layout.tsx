import { Providers } from "../app/providers";
import { getSession } from "../lib/auth";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "../components/ui/sonner";


const appUrl = process.env.NEXT_PUBLIC_URL
export const metadata: Metadata = {
  title: {
    default: 'Mystery Box DApp',
    template: '%s | Mystery Box DApp',
  },
  description: 'Win random celoUSD tokens with our Mystery Box DApp!',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://celomysterybox.vercel.com',
    siteName: 'Mystery Box DApp',
    images: [
      {
        url: '/mystery-box-og.svg',
        width: 1200,
        height: 630,
        alt: 'Mystery Box DApp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yourtwitterhandle',
    creator: '@yourtwitterhandle',
  },
};
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
              <div className="min-h-screen bg-gradient-radial from-white via-gray-50 to-gray-100 dark:from-black dark:via-black dark:to-black">
                <Header />
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
                <Toaster />
                <Footer />
              </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}