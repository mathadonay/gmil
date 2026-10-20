'use client';

import { track } from '@/lib/analytics';

/** Um sentido da rota: preenche origem e destino no formulário e leva até ele. */
export function BotaoRota({ origem, destino, nomeO, nomeD }: { origem: string; destino: string; nomeO: string; nomeD: string }) {
  return (
    <button
      type="button"
      className="rota__botao"
      aria-label={`Cotar de ${nomeO} para ${nomeD}`}
      onClick={() => {
        track({ event: 'cta_click', cta_id: 'rota', cta_text: `${origem}-${destino}` });
        window.dispatchEvent(new CustomEvent('gmil:rota', { detail: { origem, destino } }));
      }}
    >
      <strong>
        {origem} <span aria-hidden="true">→</span> {destino}
      </strong>
      <small aria-hidden="true">Cotar esta rota →</small>
    </button>
  );
}
