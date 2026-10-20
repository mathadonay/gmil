import { NextResponse, type NextRequest } from 'next/server';
import { leadSchema } from '@/lib/validators';
import { esvaziarFila, guardarEEntregar, limitarIP, montarRegistro, motivosSuspeita } from '@/lib/servidor-lead';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
  if (!limitarIP(ip)) {
    return NextResponse.json({ ok: false, erro: 'limite' }, { status: 429 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: 'json' }, { status: 400 });
  }

  const r = leadSchema.safeParse(corpo);
  if (!r.success) {
    const campos = [...new Set(r.error.issues.map((i) => String(i.path[0] ?? i.message)))];
    return NextResponse.json({ ok: false, erro: 'validacao', campos }, { status: 422 });
  }

  const lead = r.data;
  const ms = Date.now() - lead.inicio;
  const suspeito = motivosSuspeita(lead, ms);
  // Envio rápido demais de quem não caiu no honeypot: pede para conferir (pode ser autopreenchimento).
  if (ms < 2500 && !lead.site) {
    return NextResponse.json({ ok: false, erro: 'rapido' }, { status: 422 });
  }

  const registro = montarRegistro(lead, { ip, suspeito, userAgent: req.headers.get('user-agent') ?? '' });
  try {
    await guardarEEntregar(registro);
  } catch (e) {
    console.error('[lead] falha ao gravar', e);
    return NextResponse.json({ ok: false, erro: 'servidor' }, { status: 500 });
  }

  // O bot recebe "ok" igual ao humano, para não aprender a contornar.
  return NextResponse.json({ ok: true, id: lead.eventId });
}

// Reprocessa a fila (chamado por timer do systemd ou manualmente).
export async function GET(req: NextRequest) {
  const token = process.env.FILA_TOKEN;
  if (!token || req.nextUrl.searchParams.get('token') !== token) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  await esvaziarFila();
  return NextResponse.json({ ok: true });
}
