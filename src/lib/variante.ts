// Escolhe a variante da primeira dobra no servidor (sem piscar), pela ordem:
// ?v= (teste manual/A-B) → utm_campaign + utm_term (palavra-chave do Google Ads) → padrão.
import {
  ehUF,
  tituloRota,
  varianteRotasPadrao,
  variantesLotacao,
  type UF,
  type Variante,
} from '@/content/lp-gmil';

type Params = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// "transportadora pr x sp", "transportadora pr para sp", "transportadora pr sp" → PR, SP
export function rotaDoTermo(termo: string): { origem: UF; destino: UF } | null {
  const t = normalizar(termo).split(' ').filter((p) => p !== 'x' && p !== 'para' && p !== 'transportadora' && p !== 'a');
  const ufs = t.map((p) => p.toUpperCase()).filter(ehUF);
  if (ufs.length < 2 || ufs[0] === ufs[1]) return null;
  return { origem: ufs[0] as UF, destino: ufs[1] as UF };
}

function lotacaoDoTermo(termo: string) {
  const t = normalizar(termo);
  if (/\bbid\b/.test(t)) return variantesLotacao.bid;
  if (/fertilizante|adubo/.test(t)) return variantesLotacao.fertilizante;
  if (/bebida|cerveja/.test(t)) return variantesLotacao.bebidas;
  if (/sider/.test(t)) return variantesLotacao.sider;
  if (/industri/.test(t)) return variantesLotacao.industria;
  return variantesLotacao.lotacao;
}

export function escolherVariante(sp: Params): Variante {
  const v = normalizar(um(sp.v));
  const campanha = normalizar(um(sp.utm_campaign));
  const termo = um(sp.utm_term);

  // ?v=lotacao, ?v=lotacao-sider, ?v=rotas, ?v=pr-sp
  if (v) {
    const rota = rotaDoTermo(v.replace('-', ' '));
    if (rota) return { ...tituloRota(rota.origem, rota.destino), campanha: 'rotas', rota, ordemForm: 'rota-primeiro' };
    if (v.startsWith('lotacao')) {
      const chave = v.split(' ')[1] ?? v.split('-')[1];
      const base = (chave && variantesLotacao[chave]) || variantesLotacao.lotacao!;
      return { ...base, campanha: 'lotacao', ordemForm: 'carga-primeiro' };
    }
    if (v.startsWith('rotas')) return { ...varianteRotasPadrao, campanha: 'rotas', ordemForm: 'rota-primeiro' };
  }

  if (campanha.includes('lotacao')) {
    return { ...lotacaoDoTermo(termo)!, campanha: 'lotacao', ordemForm: 'carga-primeiro' };
  }

  const rota = termo ? rotaDoTermo(termo) : null;
  if (rota) return { ...tituloRota(rota.origem, rota.destino), campanha: 'rotas', rota, ordemForm: 'rota-primeiro' };

  // Termo da direcionada chegando sem utm_campaign (ex.: link manual).
  if (termo && !campanha.includes('rotas')) {
    const l = lotacaoDoTermo(termo)!;
    if (l.id !== 'lotacao:padrao') return { ...l, campanha: 'lotacao', ordemForm: 'carga-primeiro' };
  }

  return { ...varianteRotasPadrao, campanha: campanha.includes('rotas') ? 'rotas' : 'padrao', ordemForm: 'rota-primeiro' };
}
