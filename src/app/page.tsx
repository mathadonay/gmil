import Image from 'next/image';
import {
  cta,
  fechamento,
  frota,
  hero,
  marca,
  nomeUF,
  processo,
  provaSocial,
  ROTAS_CAMPANHA,
  rotas,
  whatsapp,
  type Variante,
} from '@/content/lp-gmil';
import { escolherVariante } from '@/lib/variante';
import { LeadForm } from '@/components/form/LeadForm';
import { Pendente } from '@/components/lp/Pendente';
import { Rastreio } from '@/components/lp/Rastreio';
import { BotaoRota } from '@/components/lp/BotaoRota';
import { BarraCTA } from '@/components/lp/BarraCTA';
import { Consentimento } from '@/components/lp/Consentimento';
import { CarrosselFrota } from '@/components/lp/CarrosselFrota';
import { WhatsAppFlutuante } from '@/components/lp/WhatsAppFlutuante';
import { mostrarPendencias } from '@/lib/pendencias';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Pagina({ searchParams }: Props) {
  const variante = escolherVariante(await searchParams);

  return (
    <>
      <Topo />
      <main>
        <Hero variante={variante} />
        <Frota />
        <Rotas />
        <Processo />
        <ProvaSocial />
        <Fechamento />
      </main>
      <Rodape />
      <BarraCTA />
      <WhatsAppFlutuante />
      <Consentimento />
      <Rastreio />
    </>
  );
}

function Topo() {
  return (
    <header className="topo">
      <div className="container">
        <Image src="/logo-gmil-branco.svg" alt="GMIL Transportes" width={150} height={41} className="topo__logo" priority />
        <p className="topo__nota">Cotação de carga fechada para embarcadores e indústrias</p>
      </div>
    </header>
  );
}

/** Título no estilo dos posts: um trecho em laranja (destaque) ou numa tarja escura (tarja). */
function Realce({ texto, destaque, tarja }: { texto: string; destaque?: string; tarja?: string }) {
  const alvo = destaque ?? tarja;
  const i = alvo ? texto.indexOf(alvo) : -1;
  if (!alvo || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span className={destaque ? 'destaque' : 'tarja'}>{alvo}</span>
      {texto.slice(i + alvo.length)}
    </>
  );
}

function Titulo({ variante }: { variante: Variante }) {
  if (variante.rota) {
    const { origem, destino } = variante.rota;
    return (
      <h1 className="hero__titulo">
        Transportadora
        <span className="placa" aria-label={`${origem} e ${destino}, nos dois sentidos`}>
          {origem}
          <span className="placa__seta" aria-hidden="true">
            ⇄
          </span>
          {destino}
        </span>
        para carga completa
      </h1>
    );
  }
  return (
    <h1 className="hero__titulo">
      <Realce texto={variante.titulo} destaque={variante.destaque} />
    </h1>
  );
}

function Hero({ variante }: { variante: Variante }) {
  return (
    <section className="hero lona" id="inicio" aria-label="Cotação de carga fechada">
      <div className="container hero__grade">
        <div className="hero__esquerda">
          <div className="hero__midia">
            <CarrosselFrota slides={hero.slides} />
          </div>
          <div className="hero__conteudo">
            <p className="hero__rotulo rotulo">{hero.rotulo}</p>
            <Titulo variante={variante} />
            <p className="hero__apoio">{variante.apoio}</p>
            <a href="#cotacao" className="btn-acao hero__cta-celular" data-cta="hero-celular">
              {cta.texto}
            </a>
            <ul className="fatos" aria-label="Estrutura">
              {hero.fatos.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <LeadForm
          variante={variante}
          depoisDoBotao={
            <Pendente validado={cta.prazo.validado} origem={cta.prazo.origem} como="p">
              <span className="risco">{cta.prazo.valor}</span>
            </Pendente>
          }
        />
      </div>
    </section>
  );
}

function Frota() {
  return (
    <section className="secao secao--papel" aria-labelledby="frota-t">
      <div className="container frota__grade">
        <div>
          <p className="secao__rotulo rotulo">{frota.rotulo}</p>
          <h2 className="secao__titulo" id="frota-t">
            <Realce texto={frota.titulo} destaque={frota.destaque} />
          </h2>
          <p className="secao__texto">{frota.texto}</p>
          <dl className="ficha">
            {frota.ficha.map((l) => (
              <div key={l.item}>
                <dt className="rotulo">{l.item}</dt>
                <dd>{l.valor}</dd>
              </div>
            ))}
          </dl>
          <Pendente validado={frota.seguranca.validado} origem={frota.seguranca.origem}>
            <p style={{ margin: '0 0 24px' }}>{frota.seguranca.valor}</p>
          </Pendente>
          <div className="nao-fazemos">
            <p>{frota.naoFazemos.titulo}</p>
            <ul>
              {frota.naoFazemos.itens.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="fotos">
          <figure className="f-larga">
            <Image src="/fotos/cavalos-frota.jpg" alt={frota.fotos.cavalos} fill sizes="(max-width: 900px) 100vw, 720px" quality={70} />
          </figure>
          <figure className="f-meia">
            <Image src="/fotos/sider-carregado.jpg" alt={frota.fotos.carregado} fill sizes="(max-width: 900px) 50vw, 360px" quality={70} />
          </figure>
          <figure className="f-meia">
            <Image src="/fotos/estrada-por-do-sol.jpg" alt={frota.fotos.estrada} fill sizes="(max-width: 900px) 50vw, 360px" quality={70} />
          </figure>
        </div>
      </div>
    </section>
  );
}

function Rotas() {
  return (
    <section className="secao lona com-fio" aria-labelledby="rotas-t">
      <div className="container">
        <div className="rotas__topo">
          <div>
            <p className="secao__rotulo rotulo">{rotas.rotulo}</p>
            <h2 className="secao__titulo" id="rotas-t">
              <Realce texto={rotas.titulo} destaque={rotas.destaque} />
            </h2>
            <p className="secao__texto" style={{ marginBottom: 0, color: '#dcd8d1' }}>
              {rotas.texto}
            </p>
          </div>
        </div>
        <p className="rotas__dica">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4.6 15.9a1.6 1.6 0 0 1 2.4-2.1L9 15.5" />
          </svg>
          {rotas.dica}
        </p>
        <ul className="rotas__lista">
          {ROTAS_CAMPANHA.map((uf) => (
            <li className="rota" key={uf}>
              <BotaoRota origem="PR" destino={uf} nomeO="Paraná" nomeD={nomeUF(uf)} />
              <BotaoRota origem={uf} destino="PR" nomeO={nomeUF(uf)} nomeD="Paraná" />
            </li>
          ))}
        </ul>
        <div className="rotas__rodape">
          <p>{rotas.outras}</p>
          <a href="#cotacao" className="btn-acao" data-cta="rotas">
            {cta.texto}
          </a>
        </div>
      </div>
    </section>
  );
}

function Processo() {
  return (
    <section className="secao secao--papel" aria-labelledby="processo-t">
      <div className="container">
        <p className="secao__rotulo rotulo">{processo.rotulo}</p>
        <h2 className="secao__titulo" id="processo-t">
          Análise <span className="destaque">antes do preço</span>
        </h2>
        <ol className="passos">
          {processo.passos.map((p, i) => (
            <li className="passo" key={p.titulo}>
              <span className="passo__n rotulo">Passo {i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 32 }}>
          <Pendente validado={processo.diferencial.validado} origem={processo.diferencial.origem}>
            <p className="secao__texto" style={{ margin: 0 }}>
              {processo.diferencial.valor}
            </p>
          </Pendente>
        </div>
      </div>
    </section>
  );
}

function ProvaSocial() {
  if (provaSocial.validado || !mostrarPendencias) return null;
  return (
    <section className="secao secao--papel" style={{ paddingTop: 0 }} aria-label="Depoimentos">
      <div className="container">
        <div className="bloco-pendente">
          <span className="pendente__tarja">A CONFIRMAR · {provaSocial.origem}</span>
          <p style={{ margin: '8px 0 0' }}>{provaSocial.aviso}</p>
        </div>
      </div>
    </section>
  );
}

function Fechamento() {
  return (
    <section className="secao fechamento secao--laranja" aria-labelledby="fim-t">
      <div className="container fechamento__grade">
        <figure className="fechamento__foto">
          <Image src="/fotos/carregando-industria.jpg" alt={fechamento.foto} width={720} height={533} sizes="(max-width: 900px) 100vw, 640px" quality={80} />
        </figure>
        <div>
          <h2 className="secao__titulo" id="fim-t">
            <Realce texto={fechamento.titulo} tarja={fechamento.tarja} />
          </h2>
          <p className="secao__texto">{fechamento.texto}</p>
          <a href="#cotacao" className="btn-acao btn-acao--escuro" data-cta="fechamento">
            {cta.texto}
          </a>
          {whatsapp.numero ? (
            <p style={{ marginTop: 16 }}>
              <a
                className="btn-linha"
                href={`https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(whatsapp.mensagemPadrao)}`}
                target="_blank"
                rel="noopener"
                data-cta="whatsapp-fechamento"
              >
                {whatsapp.rotulo}
              </a>
            </p>
          ) : (
            <Pendente validado={false} origem="Número do WhatsApp comercial (DDD 44) [VALIDAR]" como="p">
              <span>Botão do WhatsApp aparece aqui quando o número for confirmado.</span>
            </Pendente>
          )}
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div>
          <Image src="/logo-gmil-branco.svg" alt="GMIL Transportes" width={120} height={33} className="rodape__logo" />
          <Pendente validado={marca.razaoSocial.validado} origem={marca.razaoSocial.origem} como="p">
            <span>
              {marca.razaoSocial.valor} · CNPJ {marca.cnpj.valor}
            </span>
          </Pendente>
          <Pendente validado={marca.endereco.validado} origem={marca.endereco.origem} como="p">
            <span>{marca.endereco.valor}</span>
          </Pendente>
        </div>
        <div>
          <Pendente validado={marca.telefone.validado} origem={marca.telefone.origem} como="p">
            <a href={`tel:${marca.telefone.tel}`} data-cta="telefone-rodape">
              {marca.telefone.valor}
            </a>
          </Pendente>
          <Pendente validado={marca.email.validado} origem={marca.email.origem} como="p">
            <span>{marca.email.valor}</span>
          </Pendente>
          <p>
            <a href="/privacidade">Política de privacidade</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
