'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { registrarOrigem } from '@/lib/attribution';

/** Cliques em CTA/WhatsApp/telefone (por delegação) e profundidade de rolagem. */
export function Rastreio() {
  useEffect(() => {
    registrarOrigem();
    const aoClicar = (e: MouseEvent) => {
      const alvo = (e.target as HTMLElement).closest<HTMLElement>('[data-cta], a[href^="https://wa.me"], a[href^="tel:"]');
      if (!alvo) return;
      const href = alvo.getAttribute('href') ?? '';
      if (href.startsWith('https://wa.me')) track({ event: 'whatsapp_click', origem: alvo.dataset.cta ?? 'link' });
      else if (href.startsWith('tel:')) track({ event: 'phone_click', origem: alvo.dataset.cta ?? 'link' });
      else if (alvo.dataset.cta && !alvo.dataset.cta.startsWith('form-'))
        track({ event: 'cta_click', cta_id: alvo.dataset.cta, cta_text: alvo.textContent?.trim().slice(0, 60) });
    };
    document.addEventListener('click', aoClicar);

    const marcos = [25, 50, 75, 90];
    const vistos = new Set<number>();
    let pendente = false;
    const aoRolar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        pendente = false;
        const h = document.documentElement;
        const pct = ((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100;
        for (const m of marcos)
          if (pct >= m && !vistos.has(m)) {
            vistos.add(m);
            track({ event: 'scroll_depth', percent: m });
          }
      });
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      document.removeEventListener('click', aoClicar);
      window.removeEventListener('scroll', aoRolar);
    };
  }, []);
  return null;
}
