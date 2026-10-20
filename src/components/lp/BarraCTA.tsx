'use client';

import { useEffect, useState } from 'react';
import { cta } from '@/content/lp-gmil';

/** Celular: barra fixa depois que a primeira dobra sai da tela, escondida quando o formulário aparece. */
export function BarraCTA() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const hero = document.getElementById('inicio');
    const form = document.getElementById('cotacao');
    if (!hero || !form) return;
    let heroFora = false;
    let formVisivel = false;
    const atualizar = () => setVisivel(heroFora && !formVisivel);
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === hero) heroFora = !e.isIntersecting;
        if (e.target === form) formVisivel = e.isIntersecting;
      }
      atualizar();
    });
    io.observe(hero);
    io.observe(form);
    return () => io.disconnect();
  }, []);
  return (
    <div className="barra-cta" data-visivel={visivel} aria-hidden={!visivel}>
      <a href="#cotacao" className="btn-acao" data-cta="barra-celular" tabIndex={visivel ? 0 : -1}>
        {cta.texto}
      </a>
    </div>
  );
}
