import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { DynamicBackground } from '@/components/dynamic-background';

export const metadata: Metadata = {
  title: 'Fair Share',
  description: 'Track groceries, settlements, cooking roster, and cleaning groups.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DynamicBackground />
        <ThemeProvider>
          <div className="page-shell app-grid relative z-10">
            <Sidebar />
            <main className="relative z-10 mt-6 lg:mt-0">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
