// dataLayer sem dados pessoais. O GTM (quando houver ID e consentimento) lê daqui.
type Evento = { event: string } & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const disparados = new Set<string>();

export function track(evento: Evento, unicoPor?: string) {
  if (typeof window === 'undefined') return;
  // Evita duplicar no Strict Mode / re-render (ex.: form_view, variant_view).
  if (unicoPor) {
    if (disparados.has(unicoPor)) return;
    disparados.add(unicoPor);
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}

export async function sha256(texto: string) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}
