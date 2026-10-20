'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';

type Slide = { src: string; alt: string };

/** Fotos reais da frota, todas cortadas em 1600×720: a caixa nunca muda de tamanho entre os slides. */
export function CarrosselFrota({ slides, intervalo = 5000 }: { slides: Slide[]; intervalo?: number }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [carregados, setCarregados] = useState(1); // só a 1ª foto entra no carregamento inicial (LCP)
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    // Depois do carregamento, libera as outras fotos para a troca não piscar.
    const t = setTimeout(() => setCarregados(slides.length), 1500);
    return () => clearTimeout(t);
  }, [slides.length]);

  useEffect(() => {
    if (pausado || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setAtual((i) => (i + 1) % slides.length);
    }, intervalo);
    return () => clearInterval(t);
  }, [pausado, intervalo, slides.length]);

  const ir = (i: number, origem: string) => {
    setCarregados(slides.length);
    setAtual((i + slides.length) % slides.length);
    track({ event: 'carrossel_click', origem });
  };

  return (
    <figure
      ref={raiz}
      className="hero__foto carrossel"
      aria-roledescription="carrossel"
      aria-label="Fotos da frota GMIL"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(e) => {
        if (!raiz.current?.contains(e.relatedTarget as Node)) setPausado(false);
      }}
    >
      {slides.slice(0, carregados).map((s, i) => (
        <div
          key={s.src}
          className="carrossel__slide"
          data-ativo={i === atual}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} de ${slides.length}`}
          aria-hidden={i !== atual}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="(max-width: 900px) 100vw, 760px"
            quality={70}
            priority={i === 0}
            fetchPriority={i === 0 ? 'high' : 'auto'}
          />
        </div>
      ))}
      <figcaption className="legenda">Frota GMIL · foto real</figcaption>
      <div className="carrossel__controles">
        <button type="button" className="carrossel__seta" onClick={() => ir(atual - 1, 'anterior')} aria-label="Foto anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="carrossel__pontos">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              onClick={() => ir(i, 'ponto')}
            />
          ))}
        </div>
        <button type="button" className="carrossel__seta" onClick={() => ir(atual + 1, 'proxima')} aria-label="Próxima foto">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </figure>
  );
}
