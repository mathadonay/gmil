'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cta, obrigado, whatsapp } from '@/content/lp-gmil';
import { mostrarPendencias } from '@/lib/pendencias';

type Resumo = { origem: string; destino: string; tipoCarga?: string; faixaPeso?: string; frequencia?: string; empresa: string };

export function ObrigadoDetalhes() {
  const [r, setR] = useState<Resumo | null>(null);
  useEffect(() => {
    try {
      const s = sessionStorage.getItem('gmil_ultima_ordem');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do sessionStorage após montar
      if (s) setR(JSON.parse(s) as Resumo);
    } catch {
      /* sem resumo */
    }
  }, []);

  const msg = r
    ? `Olá, GMIL! Acabei de pedir uma cotação pela página. Rota: ${r.origem} → ${r.destino}. Carga: ${r.tipoCarga ?? '-'}, ${r.faixaPeso ?? '-'}, ${r.frequencia ?? '-'}. Empresa: ${r.empresa}.`
    : whatsapp.mensagemPadrao;

  return (
    <>
      {r && (
        <div className="resumo">
          <dl>
            <dt>Rota</dt>
            <dd>
              {r.origem} → {r.destino}
            </dd>
            <dt>Carga</dt>
            <dd>{[r.tipoCarga, r.faixaPeso].filter(Boolean).join(' · ')}</dd>
            <dt>Frequência</dt>
            <dd>{r.frequencia}</dd>
            <dt>Empresa</dt>
            <dd>{r.empresa}</dd>
          </dl>
        </div>
      )}
      {mostrarPendencias && !cta.prazo.validado && (
        <p className="pendente">
          <span className="pendente__tarja">A CONFIRMAR · {cta.prazo.origem}</span>
          <br />
          {cta.prazo.valor}
        </p>
      )}
      {whatsapp.numero ? (
        <>
          <p style={{ color: '#dcd8d1' }}>{obrigado.proximo}</p>
          <a
            className="btn-linha"
            style={{ color: 'var(--papel)' }}
            href={`https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noopener"
            data-cta="whatsapp-obrigado"
          >
            {whatsapp.rotulo}
          </a>
        </>
      ) : (
        mostrarPendencias && (
          <p className="pendente">
            <span className="pendente__tarja">A CONFIRMAR · WhatsApp comercial</span>
            <br />
            Aqui entra o botão &quot;{whatsapp.rotulo}&quot; com a mensagem já escrita: “{msg}”
          </p>
        )
      )}
      <p style={{ marginTop: 32 }}>
        <Link href="/" style={{ color: 'var(--prata)' }}>
          Voltar para a página
        </Link>
      </p>
    </>
  );
}
