// Origem do lead: UTMs e click ids, primeiro e último toque, guardados por 30 dias.
const CHAVE = 'gmil_origem';
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'oppref',
] as const;

export type Toque = Partial<Record<(typeof PARAMS)[number], string>> & {
  pagina: string;
  referrer: string;
  data: string;
};
export type Origem = { primeiro: Toque; ultimo: Toque; canal: string };

function classificar(t: Toque): string {
  const src = (t.utm_source ?? '').toLowerCase();
  if (t.gclid || t.gbraid || t.wbraid || src === 'gads' || src === 'google' && t.utm_medium?.toLowerCase() === 'cpc') return 'Google Ads';
  if (t.fbclid || ['meta', 'facebook', 'instagram'].includes(src)) return 'Meta Ads';
  if (t.li_fat_id || src === 'linkedin') return 'LinkedIn Ads';
  if (t.oppref || src === 'chatgpt') return 'ChatGPT Ads';
  if (t.msclkid) return 'Microsoft Ads';
  if (src) return src;
  const ref = t.referrer;
  if (!ref) return 'Direto';
  if (/google\.|bing\.|duckduckgo\.|yahoo\./.test(ref)) return 'Orgânico';
  return 'Indicação';
}

export function registrarOrigem(): Origem | null {
  try {
    const url = new URL(window.location.href);
    const toque: Toque = {
      pagina: url.pathname + url.search,
      referrer: document.referrer.startsWith(url.origin) ? '' : document.referrer,
      data: new Date().toISOString(),
    };
    let temParam = false;
    for (const p of PARAMS) {
      const v = url.searchParams.get(p);
      if (v) {
        toque[p] = v.slice(0, 200);
        temParam = true;
      }
    }
    const salvo = lerOrigem();
    const novo: Origem = salvo
      ? { primeiro: salvo.primeiro, ultimo: temParam || toque.referrer ? toque : salvo.ultimo, canal: '' }
      : { primeiro: toque, ultimo: toque, canal: '' };
    novo.canal = classificar(novo.ultimo);
    localStorage.setItem(CHAVE, JSON.stringify({ ...novo, expira: Date.now() + TRINTA_DIAS }));
    return novo;
  } catch {
    return null;
  }
}

export function lerOrigem(): Origem | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const o = JSON.parse(bruto) as Origem & { expira: number };
    if (o.expira < Date.now()) {
      localStorage.removeItem(CHAVE);
      return null;
    }
    return { primeiro: o.primeiro, ultimo: o.ultimo, canal: o.canal };
  } catch {
    return null;
  }
}
