import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Navbar } from '@/components/Navbar';
import { FloatingAssistant } from '@/components/FloatingAssistant';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto-sans-devanagari',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

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
    <html lang="mr" dir="ltr" className={`${inter.variable} ${notoSansDevanagari.variable}`}>
      <body className="antialiased min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-steel-soft selection:text-ink">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <footer className="mt-auto border-t border-steel/60 bg-white/70 backdrop-blur-sm py-6 text-center text-xs text-ink-secondary">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-semibold text-ink">
                🌾 <span className="font-bold">रोजगारमित्र (RojgarMitra)</span> • विदर्भ औद्योगिक रोजगार व्यासपीठ
              </p>
              <p className="text-ink-secondary/80">
                पायलट परिसर: नागपूर, बुटीबोरी, हिंगणा, उमरेड • 100% सत्यापित पदे • थेट संपर्क
              </p>
            </div>
          </footer>
          <FloatingAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
