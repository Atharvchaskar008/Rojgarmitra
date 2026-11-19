import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Navbar } from '@/components/Navbar';

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
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>
              🌾 <strong>रोजगारमित्र (RojgarMitra)</strong> • YCCE HackKumbh 2026
            </p>
            <p className="mt-1 text-slate-400">
              पायलट परिसर: नागपूर, बुटीबोरी, हिंगणा व ग्रामीण विदर्भ | आधार किंवा इंग्रजी बायोडाटाची सक्ती नाही
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
