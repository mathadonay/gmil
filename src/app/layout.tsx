import type { Metadata, Viewport } from 'next';
import { archivo, poppins } from '@/styles/fonts';
import '@/styles/globals.css';

const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gmil.nedir.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'Cotação de carga fechada | GMIL Transportes',
  description:
    'Lotação em carreta sider, graneleiro, aberta e grade baixa, saindo e chegando ao Paraná. Envie a rota e a carga e receba a análise da equipe comercial da GMIL.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Cotação de carga fechada | GMIL Transportes',
    description: 'Lotação saindo e chegando ao Paraná, nos dois sentidos. Cote a sua rota com a GMIL.',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/fotos/sider-noite.jpg', width: 1599, height: 899, alt: 'Carreta sider da GMIL Transportes' }],
  },
  icons: { icon: '/icone.svg' },
};

export const viewport: Viewport = { themeColor: '#1f2021', width: 'device-width', initialScale: 1 };

// Consent Mode v2: tudo negado até o visitante escolher.
const consentPadrao = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${archivo.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: consentPadrao }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
