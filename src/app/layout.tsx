
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; 
import { NUMBER_OF_CELLS } from '@/lib/constants';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { SidebarInset } from '@/components/ui/sidebar'; 
import ElectricBackgroundAnimation from '@/components/electric-background-animation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Battery Monitor',
  description: `Real-time ${NUMBER_OF_CELLS}-cell lithium battery voltage monitoring and diagnostics.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300 relative`}>
        <ElectricBackgroundAnimation />
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-screen relative z-10"> {/* Ensure content is above background */}
            <SidebarNav connectionStatus="initial" /> {/* Placeholder status */}
            <SidebarInset className="flex-1">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
