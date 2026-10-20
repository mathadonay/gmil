'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { form as t, cta, UFS, type Variante, type TipoCarga, type FaixaPeso, type Frequencia } from '@/content/lp-gmil';
import { track, sha256 } from '@/lib/analytics';
import { lerOrigem, registrarOrigem } from '@/lib/attribution';
import { cnpjValido, soDigitos, whatsappValido } from '@/lib/validators';

type Etapa = 'rota' | 'carga' | 'contato';
type Dados = {
  origemUF: string;
  origemCidade: string;
  destinoUF: string;
  destinoCidade: string;
  tipoCarga: TipoCarga | '';
  faixaPeso: FaixaPeso | '';
  frequencia: Frequencia | '';
  nome: string;
  empresa: string;
  cnpj: string;
  whatsapp: string;
  email: string;
  obs: string;
  aceite: boolean;
  site: string;
};
type Erros = Partial<Record<keyof Dados, string>>;

function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function mascaraCNPJ(v: string) {
  const d = soDigitos(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function LeadForm({ variante, depoisDoBotao }: { variante: Variante; depoisDoBotao?: React.ReactNode }) {
  const router = useRouter();
  const uid = useId();
  const ordem = useMemo<Etapa[]>(
    () => (variante.ordemForm === 'carga-primeiro' ? ['carga', 'rota', 'contato'] : ['rota', 'carga', 'contato']),
    [variante.ordemForm],
  );
  const [indice, setIndice] = useState(0);
  const etapa = ordem[indice]!;
  const [dados, setDados] = useState<Dados>({
    origemUF: variante.rota?.origem ?? 'PR',
    origemCidade: '',
    destinoUF: variante.rota?.destino ?? '',
    destinoCidade: '',
    tipoCarga: variante.tipoCarga ?? '',
    faixaPeso: '',
    frequencia: variante.frequencia ?? '',
    nome: '',
    empresa: '',
    cnpj: '',
    whatsapp: '',
    email: '',
    obs: '',
    aceite: false,
    site: '',
  });
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState('');
  const inicio = useRef(0);
  const comecou = useRef(false);
  const raiz = useRef<HTMLFormElement>(null);
  const tituloEtapa = useRef<HTMLLegendElement>(null);

  // Origem do visitante, visualização do formulário e da variante.
  useEffect(() => {
    inicio.current = Date.now();
    registrarOrigem();
    track({ event: 'variant_view', variant: variante.id }, `variant:${variante.id}`);
    const el = raiz.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          track({ event: 'form_view', variant: variante.id }, 'form_view');
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variante.id]);

  // Clique numa rota da dobra "Os dois sentidos" preenche o formulário.
  useEffect(() => {
    const aoEscolherRota = (e: Event) => {
      const { origem, destino } = (e as CustomEvent<{ origem: string; destino: string }>).detail;
      setDados((d) => ({ ...d, origemUF: origem, destinoUF: destino }));
      setErros((x) => ({ ...x, origemUF: undefined, destinoUF: undefined }));
      setIndice(ordem.indexOf('rota'));
      raiz.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => raiz.current?.querySelector<HTMLElement>('select, input')?.focus({ preventScroll: true }), 400);
    };
    window.addEventListener('gmil:rota', aoEscolherRota);
    return () => window.removeEventListener('gmil:rota', aoEscolherRota);
  }, [ordem]);

  function marcarInicio() {
    if (comecou.current) return;
    comecou.current = true;
    track({ event: 'form_start', variant: variante.id });
  }

  function mudar<K extends keyof Dados>(campo: K, valor: Dados[K]) {
    marcarInicio();
    setDados((d) => ({ ...d, [campo]: valor }));
    if (erros[campo]) setErros((x) => ({ ...x, [campo]: undefined }));
  }

  function validar(e: Etapa): Erros {
    const x: Erros = {};
    if (e === 'rota') {
      if (!dados.origemUF) x.origemUF = t.erros.uf;
      if (!dados.destinoUF) x.destinoUF = t.erros.uf;
    }
    if (e === 'carga') {
      if (!dados.tipoCarga) x.tipoCarga = t.erros.tipo;
      if (!dados.faixaPeso) x.faixaPeso = t.erros.peso;
      if (!dados.frequencia) x.frequencia = t.erros.frequencia;
    }
    if (e === 'contato') {
      if (dados.nome.trim().length < 2) x.nome = t.erros.nome;
      if (dados.empresa.trim().length < 2) x.empresa = t.erros.empresa;
      if (dados.cnpj && !cnpjValido(dados.cnpj)) x.cnpj = t.erros.cnpj;
      if (!whatsappValido(dados.whatsapp)) x.whatsapp = t.erros.whatsapp;
      if (!emailValido(dados.email)) x.email = t.erros.email;
      if (!dados.aceite) x.aceite = t.erros.aceite;
    }
    return x;
  }

  function focarPrimeiroErro(x: Erros) {
    const primeiro = Object.keys(x)[0];
    if (!primeiro) return;
    requestAnimationFrame(() => raiz.current?.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus());
    for (const campo of Object.keys(x)) track({ event: 'form_error', field: campo, step: etapa });
  }

  function irPara(i: number) {
    setIndice(i);
    requestAnimationFrame(() => tituloEtapa.current?.focus());
  }

  function avancar() {
    const x = validar(etapa);
    setErros(x);
    if (Object.keys(x).length) return focarPrimeiroErro(x);
    track({ event: 'form_step', step: indice + 2, step_name: ordem[indice + 1], variant: variante.id });
    irPara(indice + 1);
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (indice < ordem.length - 1) return avancar();
    // Revalida tudo antes de enviar (o visitante pode ter voltado e mudado algo).
    const x = { ...validar('rota'), ...validar('carga'), ...validar('contato') };
    setErros(x);
    if (Object.keys(x).length) {
      const etapaComErro = ordem.find((e) => Object.keys(validar(e)).length);
      if (etapaComErro && etapaComErro !== etapa) setIndice(ordem.indexOf(etapaComErro));
      return focarPrimeiroErro(x);
    }
    setEnviando(true);
    setFalha('');
    const eventId = crypto.randomUUID();
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...dados, eventId, variante: variante.id, inicio: inicio.current, origem: lerOrigem() }),
      });
      const corpo = (await res.json().catch(() => ({}))) as { ok?: boolean; erro?: string; campos?: string[] };
      if (!res.ok || !corpo.ok) {
        setFalha(corpo.erro === 'rapido' ? t.erros.rapido : t.erros.envio);
        if (corpo.erro === 'rapido') inicio.current = Date.now() - 5000;
        setEnviando(false);
        return;
      }
      // Conversão: só respostas que qualificam, nada pessoal em claro.
      const [em, tel] = await Promise.all([
        sha256(dados.email.trim().toLowerCase()),
        sha256('+55' + soDigitos(dados.whatsapp)),
      ]);
      track({
        event: 'generate_lead',
        event_id: eventId,
        variant: variante.id,
        tipo_carga: dados.tipoCarga,
        faixa_peso: dados.faixaPeso,
        frequencia: dados.frequencia,
        uf_origem: dados.origemUF,
        uf_destino: dados.destinoUF,
        enhanced_conversion_data: { sha256_email_address: em, sha256_phone_number: tel },
      });
      try {
        sessionStorage.setItem(
          'gmil_ultima_ordem',
          JSON.stringify({
            origem: `${dados.origemCidade ? dados.origemCidade + '/' : ''}${dados.origemUF}`,
            destino: `${dados.destinoCidade ? dados.destinoCidade + '/' : ''}${dados.destinoUF}`,
            tipoCarga: t.carga.tipos.find(([k]) => k === dados.tipoCarga)?.[1],
            faixaPeso: t.carga.pesos.find(([k]) => k === dados.faixaPeso)?.[1],
            frequencia: t.carga.frequencias.find(([k]) => k === dados.frequencia)?.[1],
            empresa: dados.empresa,
          }),
        );
      } catch {
        /* sem sessionStorage: a página de obrigado mostra a versão genérica */
      }
      router.push('/obrigado');
    } catch {
      setFalha(t.erros.envio);
      setEnviando(false);
    }
  }

  const errId = (c: keyof Dados) => `${uid}-${c}-erro`;
  const propsErro = (c: keyof Dados) =>
    erros[c] ? { 'aria-invalid': true as const, 'aria-describedby': errId(c) } : {};
  const erro = (c: keyof Dados) =>
    erros[c] ? (
      <p className="erro" id={errId(c)}>
        {erros[c]}
      </p>
    ) : null;

  const opcoes = <K extends 'tipoCarga' | 'faixaPeso' | 'frequencia'>(campo: K, titulo: string, lista: [string, string][]) => (
    <div className="grupo" role="radiogroup" aria-labelledby={`${uid}-${campo}-t`} {...(erros[campo] ? { 'aria-describedby': errId(campo) } : {})}>
      <span className="grupo__titulo" id={`${uid}-${campo}-t`}>
        {titulo}
      </span>
      <div className="opcoes">
        {lista.map(([valor, rotulo]) => (
          <label className="opcao" key={valor}>
            <input
              type="radio"
              name={campo}
              value={valor}
              checked={dados[campo] === valor}
              onChange={() => mudar(campo, valor as Dados[K])}
            />
            <span>{rotulo}</span>
          </label>
        ))}
      </div>
      {erro(campo)}
    </div>
  );

  return (
    <form ref={raiz} className="ordem" id="cotacao" onSubmit={enviar} noValidate aria-labelledby={`${uid}-titulo`}>
      <div className="ordem__cab">
        <h2 className="rotulo" id={`${uid}-titulo`}>
          {t.titulo}
        </h2>
        <p>{t.resumo}</p>
      </div>
      <div className="ordem__corpo">
        <p className="ordem__para">{t.paraQuem}</p>
        <ol className="progresso" aria-label="Etapas do formulário">
          {ordem.map((e, i) => (
            <li key={e} data-estado={i < indice ? 'feito' : i === indice ? 'atual' : 'depois'} aria-current={i === indice ? 'step' : undefined}>
              {t.etapas[e]}
            </li>
          ))}
        </ol>

        {/* Honeypot: invisível para pessoas, preenchido por robôs. */}
        <div className="hp" aria-hidden="true">
          <label>
            Site
            <input type="text" name="site" tabIndex={-1} autoComplete="off" value={dados.site} onChange={(e) => mudar('site', e.target.value)} />
          </label>
        </div>

        {etapa === 'rota' && (
          <fieldset className="etapa">
            <legend ref={tituloEtapa} tabIndex={-1}>
              Qual é a rota?
            </legend>
            {(['origem', 'destino'] as const).map((lado) => {
              const ufC = `${lado}UF` as const;
              const cidC = `${lado}Cidade` as const;
              return (
                <div key={lado}>
                  <div className="trecho">
                    <span className="trecho__nome rotulo">{t.rota[lado]}</span>
                    <div className="campo">
                      <label htmlFor={`${uid}-${ufC}`}>{t.rota.uf}</label>
                      <select id={`${uid}-${ufC}`} name={ufC} className="entrada" value={dados[ufC]} onChange={(e) => mudar(ufC, e.target.value)} {...propsErro(ufC)}>
                        <option value="">—</option>
                        {UFS.map(([s, n]) => (
                          <option key={s} value={s} title={n}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="campo">
                      <label htmlFor={`${uid}-${cidC}`}>{t.rota.cidade}</label>
                      <input
                        id={`${uid}-${cidC}`}
                        name={cidC}
                        className="entrada"
                        placeholder={t.rota.cidadePlaceholder}
                        autoComplete="off"
                        value={dados[cidC]}
                        onChange={(e) => mudar(cidC, e.target.value)}
                      />
                    </div>
                  </div>
                  {erro(ufC)}
                  {lado === 'origem' && (
                    <div className="inverter">
                      <button
                        type="button"
                        className="btn-inverter"
                        onClick={() =>
                          setDados((d) => ({ ...d, origemUF: d.destinoUF, destinoUF: d.origemUF, origemCidade: d.destinoCidade, destinoCidade: d.origemCidade }))
                        }
                      >
                        <span aria-hidden="true">⇅</span> {t.rota.inverter}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <p className="campo__ajuda">{t.rota.ajuda}</p>
          </fieldset>
        )}

        {etapa === 'carga' && (
          <fieldset className="etapa">
            <legend ref={tituloEtapa} tabIndex={-1}>
              Qual é a carga?
            </legend>
            {opcoes('tipoCarga', t.carga.tipo, t.carga.tipos)}
            {opcoes('faixaPeso', t.carga.peso, t.carga.pesos)}
            {opcoes('frequencia', t.carga.frequencia, t.carga.frequencias)}
          </fieldset>
        )}

        {etapa === 'contato' && (
          <fieldset className="etapa">
            <legend ref={tituloEtapa} tabIndex={-1}>
              Para quem enviamos a cotação?
            </legend>
            {(
              [
                ['nome', t.contato.nome, 'text', 'name', ''],
                ['empresa', t.contato.empresa, 'text', 'organization', ''],
              ] as const
            ).map(([c, rot, tipo, ac]) => (
              <div className="campo" key={c}>
                <label htmlFor={`${uid}-${c}`}>{rot}</label>
                <input id={`${uid}-${c}`} name={c} type={tipo} autoComplete={ac} className="entrada" value={dados[c]} onChange={(e) => mudar(c, e.target.value)} {...propsErro(c)} />
                {erro(c)}
              </div>
            ))}
            <div className="campo">
              <label htmlFor={`${uid}-cnpj`}>
                {t.contato.cnpj} <span className="campo__ajuda">(opcional)</span>
              </label>
              <input
                id={`${uid}-cnpj`}
                name="cnpj"
                inputMode="numeric"
                className="entrada"
                placeholder="00.000.000/0000-00"
                value={dados.cnpj}
                onChange={(e) => mudar('cnpj', mascaraCNPJ(e.target.value))}
                {...propsErro('cnpj')}
              />
              {erro('cnpj')}
            </div>
            <div className="campo">
              <label htmlFor={`${uid}-whatsapp`}>{t.contato.whatsapp}</label>
              <input
                id={`${uid}-whatsapp`}
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className="entrada"
                placeholder={t.contato.whatsappPlaceholder}
                value={dados.whatsapp}
                onChange={(e) => mudar('whatsapp', mascaraTelefone(e.target.value))}
                {...propsErro('whatsapp')}
              />
              {erro('whatsapp')}
            </div>
            <div className="campo">
              <label htmlFor={`${uid}-email`}>{t.contato.email}</label>
              <input
                id={`${uid}-email`}
                name="email"
                type="email"
                autoComplete="email"
                className="entrada"
                placeholder={t.contato.emailPlaceholder}
                value={dados.email}
                onChange={(e) => mudar('email', e.target.value)}
                {...propsErro('email')}
              />
              {erro('email')}
            </div>
            <div className="campo">
              <label htmlFor={`${uid}-obs`}>
                {t.contato.obs} <span className="campo__ajuda">(opcional)</span>
              </label>
              <textarea id={`${uid}-obs`} name="obs" className="entrada" placeholder={t.contato.obsPlaceholder} value={dados.obs} onChange={(e) => mudar('obs', e.target.value)} />
            </div>
            <label className="aceite">
              <input type="checkbox" name="aceite" checked={dados.aceite} onChange={(e) => mudar('aceite', e.target.checked)} {...propsErro('aceite')} />
              <span>
                {t.contato.aceite}{' '}
                <a href="/privacidade" target="_blank" rel="noopener">
                  {t.contato.aceiteLink}
                </a>
                .
              </span>
            </label>
            {erro('aceite')}
          </fieldset>
        )}

        <div className="acoes">
          {indice > 0 && (
            <button type="button" className="btn-voltar" onClick={() => irPara(indice - 1)}>
              {t.voltar}
            </button>
          )}
          {indice < ordem.length - 1 ? (
            <button key="continuar" type="button" className="btn-acao btn-acao--cheio" onClick={avancar} data-cta="form-continuar">
              {t.continuar}
              <Seta />
            </button>
          ) : (
            <button key="enviar" type="submit" className="btn-acao btn-acao--cheio" disabled={enviando} aria-disabled={enviando} data-cta="form-enviar">
              {enviando ? (
                <>
                  <span className="carregando" aria-hidden="true" /> {t.enviando}
                </>
              ) : (
                <>
                  {cta.texto}
                  <Seta />
                </>
              )}
            </button>
          )}
        </div>
        <div aria-live="polite" role="status">
          {falha && (
            <p className="status-envio erro" role="alert">
              {falha}
            </p>
          )}
        </div>
        <p className="risco">{cta.risco}</p>
        {depoisDoBotao}
      </div>
    </form>
  );
}

function Seta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
