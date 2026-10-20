import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { obrigado } from '@/content/lp-gmil';
import { ObrigadoDetalhes } from './ObrigadoDetalhes';

export const metadata: Metadata = {
  title: 'Cotação recebida | GMIL Transportes',
  robots: { index: false, follow: false },
};

export default function Obrigado() {
  return (
    <>
      <header className="topo">
        <div className="container">
          <Link href="/" aria-label="Voltar para a página de cotação">
            <Image src="/logo-gmil-branco.svg" alt="GMIL Transportes" width={150} height={41} className="topo__logo" />
          </Link>
        </div>
      </header>
      <main className="lona" style={{ minHeight: 'calc(100vh - 69px)' }}>
        <div className="container">
          <div className="simples">
            <p className="rotulo" style={{ color: 'var(--prata)' }}>
              Ordem de cotação enviada
            </p>
            <h1>{obrigado.titulo}</h1>
            <p style={{ fontSize: '1.125rem', color: '#dcd8d1' }}>{obrigado.texto}</p>
            <ObrigadoDetalhes />
          </div>
        </div>
      </main>
    </>
  );
}
