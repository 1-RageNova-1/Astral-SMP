import './globals.css';
import Providers from './providers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Astral Smp',
  description: 'Minecraft server store and community',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}