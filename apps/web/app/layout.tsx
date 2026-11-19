import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RojgarMitra | रोजगारमित्र — Local Skills. Real Opportunities.',
  description: 'Rural and semi-urban employment and vocational skill development platform for Vidarbha & Maharashtra.',
  keywords: ['RojgarMitra', 'रोजगारमित्र', 'Jobs', 'Nagpur', 'Vidarbha', 'ITI', 'Skills', 'Vocational']
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" dir="ltr">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
