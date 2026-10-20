import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Lead } from './validators';
import { nomeUF } from '@/content/lp-gmil';

// ---------- limite por IP (memória do processo; basta para uma LP de um servidor) ----------
const janelas = new Map<string, number[]>();
export function limitarIP(ip: string, max = 5, janelaMs = 10 * 60 * 1000) {
  const agora = Date.now();
  const lista = (janelas.get(ip) ?? []).filter((t) => agora - t < janelaMs);
  lista.push(agora);
  janelas.set(ip, lista);
  if (janelas.size > 5000) janelas.clear();
  return lista.length <= max;
}

// ---------- sinais de spam: o lead vai para revisão, não para o comercial ----------
const EMAILS_TESTE = /^(test|teste|asdf|qwe|aaa)[^@]*@(mail|test|teste|example)\./i;
export function motivosSuspeita(l: Lead, ms: number): string[] {
  const m: string[] = [];
  if (l.site) m.push('honeypot');
  if (ms < 4000) m.push('rapido-demais');
  if (EMAILS_TESTE.test(l.email)) m.push('email-de-teste');
  const livre = `${l.obs} ${l.empresa} ${l.nome}`;
  if (/https?:\/\/|www\.|mega\.nz|t\.me\//i.test(livre)) m.push('link-no-texto');
  if (/motorista|agregad|vaga|emprego|curr[ií]culo/i.test(livre)) m.push('perfil-motorista');
  if (/mudan[cç]a/i.test(livre)) m.push('mudanca');
  return m;
}

// ---------- rótulos legíveis ----------
const ROT = {
  tipoCarga: { agro: 'Agro / grãos', fertilizante: 'Fertilizante', bebidas: 'Bebidas', industrializada: 'Industrializada', outra: 'Outra' },
  faixaPeso: { ate14: 'Até 14 t', '14a27': '14 a 27 t', '27a37': '27 a 37 t', acima37: 'Acima de 37 t', 'nao-sei': 'Ainda não sei' },
  frequencia: { pontual: 'Carga pontual', recorrente: 'Recorrente', bid: 'BID / concorrência' },
} as const;

export function montarRegistro(l: Lead, extra: { ip: string; suspeito: string[]; userAgent: string }) {
  const dataHora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());
  const rota = `${l.origemCidade ? l.origemCidade + '/' : ''}${l.origemUF} → ${l.destinoCidade ? l.destinoCidade + '/' : ''}${l.destinoUF}`;
  return {
    id: l.eventId,
    recebidoEm: new Date().toISOString(),
    dataHoraBrasilia: dataHora,
    status: extra.suspeito.length ? 'revisar' : 'novo',
    suspeito: extra.suspeito,
    assunto: `[LP gmil] ${l.nome} · ${l.empresa} · ${l.origemUF}→${l.destinoUF} · ${ROT.frequencia[l.frequencia]}`,
    rota,
    origemUF: l.origemUF,
    origemUFNome: nomeUF(l.origemUF),
    origemCidade: l.origemCidade,
    destinoUF: l.destinoUF,
    destinoUFNome: nomeUF(l.destinoUF),
    destinoCidade: l.destinoCidade,
    tipoCarga: ROT.tipoCarga[l.tipoCarga],
    faixaPeso: ROT.faixaPeso[l.faixaPeso],
    frequencia: ROT.frequencia[l.frequencia],
    nome: l.nome,
    empresa: l.empresa,
    cnpj: l.cnpj,
    whatsapp: l.whatsapp,
    email: l.email,
    obs: l.obs,
    variante: l.variante,
    canal: l.origem?.canal ?? '',
    origemPrimeiroToque: l.origem?.primeiro ?? null,
    origemUltimoToque: l.origem?.ultimo ?? null,
    ip: extra.ip,
    userAgent: extra.userAgent.slice(0, 300),
  };
}
export type Registro = ReturnType<typeof montarRegistro>;

// ---------- persistência e entrega: nunca perder lead ----------
const DIR = process.env.LEADS_DIR || path.join(process.cwd(), 'data');
const ARQ_TODOS = path.join(DIR, 'leads.jsonl'); // cópia de tudo que chegou
const ARQ_FILA = path.join(DIR, 'fila.json'); // o que ainda não chegou ao webhook

async function lerFila(): Promise<Registro[]> {
  try {
    return JSON.parse(await readFile(ARQ_FILA, 'utf8')) as Registro[];
  } catch {
    return [];
  }
}

async function enviarWebhook(r: Registro) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return false;
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.N8N_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.N8N_WEBHOOK_TOKEN}` } : {}),
        },
        body: JSON.stringify(r),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return true;
    } catch {
      /* tenta de novo */
    }
    await new Promise((ok) => setTimeout(ok, 800 * (tentativa + 1)));
  }
  return false;
}

let processando = false;
export async function guardarEEntregar(r: Registro) {
  await mkdir(DIR, { recursive: true });
  await appendFile(ARQ_TODOS, JSON.stringify(r) + '\n', { mode: 0o600 });
  // Suspeitos ficam só no arquivo, para revisão; não vão ao comercial.
  if (r.status === 'revisar') return;
  const fila = await lerFila();
  fila.push(r);
  await writeFile(ARQ_FILA, JSON.stringify(fila), { mode: 0o600 });
  void esvaziarFila();
}

export async function esvaziarFila() {
  if (processando || !process.env.N8N_WEBHOOK_URL) return;
  processando = true;
  try {
    const fila = await lerFila();
    const restantes: Registro[] = [];
    for (const r of fila) if (!(await enviarWebhook(r))) restantes.push(r);
    // Relê para não apagar o que entrou enquanto enviávamos.
    const atual = await lerFila();
    const enviados = new Set(fila.filter((r) => !restantes.includes(r)).map((r) => r.id));
    await writeFile(ARQ_FILA, JSON.stringify(atual.filter((r) => !enviados.has(r.id))), { mode: 0o600 });
  } finally {
    processando = false;
  }
}
