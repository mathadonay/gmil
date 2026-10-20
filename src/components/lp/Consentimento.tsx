'use client';

import { useEffect, useState } from 'react';

const CHAVE = 'gmil_consentimento';
const GTM = process.env.NEXT_PUBLIC_GTM_ID ?? '';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function carregarGTM() {
  if (!GTM || document.getElementById('gtm-js')) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.id = 'gtm-js';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM}`;
  document.head.appendChild(s);
}

function atualizar(aceito: boolean) {
  const v = aceito ? 'granted' : 'denied';
  window.gtag?.('consent', 'update', {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
  if (aceito) carregarGTM();
}

/** LGPD + Consent Mode v2: tudo negado por padrão (script no layout); GTM só depois do aceite. */
export function Consentimento() {
  const [pergunta, setPergunta] = useState(false);
  useEffect(() => {
    let salvo: string | null = null;
    try {
      salvo = localStorage.getItem(CHAVE);
    } catch {
      /* navegação privada */
    }
    if (salvo === 'aceito') atualizar(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o aviso depende do localStorage, só legível depois de montar
    else if (salvo !== 'recusado') setPergunta(true);
  }, []);

  if (!pergunta) return null;
  const decidir = (aceito: boolean) => {
    try {
      localStorage.setItem(CHAVE, aceito ? 'aceito' : 'recusado');
    } catch {
      /* segue sem lembrar */
    }
    atualizar(aceito);
    setPergunta(false);
  };
  return (
    <div className="consent" role="dialog" aria-label="Cookies e medição">
      <p>
        Usamos cookies para medir os anúncios e melhorar esta página. O formulário funciona com ou sem eles.{' '}
        <a href="/privacidade">Saiba mais</a>.
      </p>
      <div className="consent__acoes">
        <button type="button" className="aceitar" onClick={() => decidir(true)}>
          Aceitar
        </button>
        <button type="button" onClick={() => decidir(false)}>
          Recusar
        </button>
      </div>
    </div>
  );
}
