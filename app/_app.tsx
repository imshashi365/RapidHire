import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
