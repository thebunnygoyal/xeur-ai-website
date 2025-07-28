import type { Metadata } from 'next';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weights: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'XEUR.AI - Revolutionary Game Creation Platform',
    template: '%s | XEUR.AI',
  },
  description: 'Create complete games with a single prompt. Revolutionary AI-powered platform democratizing game creation for 590M+ creators worldwide. Made in India for the World.',
  keywords: [
    'AI game creation',
    'game development',
    'artificial intelligence',
    'no-code gaming',
    'game creation platform',
    'Made in India',
    'startup',
    'gaming AI',
    'prompt-based games',
    'revolutionary technology'
  ],
  authors: [
    { name: 'Harshit Verma', url: 'https://xeur.ai' },
    { name: 'Rishav Goyal', url: 'https://xeur.ai' },
  ],
  creator: 'XEUR.AI Team',
  publisher: 'XEUR.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://xeur.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://xeur.ai',
    title: 'XEUR.AI - Revolutionary Game Creation Platform',
    description: 'Create complete games with a single prompt. Revolutionary AI-powered platform democratizing game creation for 590M+ creators worldwide.',
    siteName: 'XEUR.AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'XEUR.AI - Game Creation Just Went God Mode',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XEUR.AI - Revolutionary Game Creation Platform',
    description: 'Create complete games with a single prompt. Made in India for the World.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1a0b2e" />
        <meta name="msapplication-TileColor" content="#1a0b2e" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.ANALYTICS_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-black to-black" />
          <div className="absolute inset-0 neural-grid opacity-30" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary-950/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-950/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: 'rgba(26, 11, 46, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(157, 78, 221, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
            success: {
              duration: 3000,
              style: {
                border: '1px solid rgba(57, 255, 20, 0.3)',
              },
            },
            error: {
              duration: 5000,
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
            },
          }}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'XEUR.AI',
              alternateName: 'XEUR Artificial Intelligence',
              url: 'https://xeur.ai',
              logo: 'https://xeur.ai/logo.png',
              description: 'Revolutionary AI-powered game creation platform democratizing game development for creators worldwide.',
              foundingDate: '2024',
              founders: [
                {
                  '@type': 'Person',
                  name: 'Harshit Verma',
                  jobTitle: 'CEO & Founder',
                },
                {
                  '@type': 'Person',
                  name: 'Rishav Goyal',
                  jobTitle: 'COO & Co-founder',
                },
              ],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
                addressLocality: 'India',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@xeur.ai',
                contactType: 'customer service',
              },
              sameAs: [
                'https://github.com/cpg-xeur-ai',
                'https://linkedin.com/company/xeur-ai',
              ],
              keywords: 'AI, game creation, artificial intelligence, gaming, startup, Made in India',
              industry: 'Technology',
              numberOfEmployees: '10-50',
              organizationType: 'Private Company',
            }),
          }}
        />
      </body>
    </html>
  );
}