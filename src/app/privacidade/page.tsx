import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { marca } from '@/content/lp-gmil';

export const metadata: Metadata = {
  title: 'Política de privacidade | GMIL Transportes',
  robots: { index: false, follow: false },
};

export default function Privacidade() {
  return (
    <>
      <header className="topo">
        <div className="container">
          <Link href="/" aria-label="Voltar para a página de cotação">
            <Image src="/logo-gmil-branco.svg" alt="GMIL Transportes" width={150} height={41} className="topo__logo" />
          </Link>
        </div>
      </header>
      <main className="secao--papel">
        <div className="container">
          <article className="simples" style={{ color: 'var(--tinta)' }}>
            <h1>Política de privacidade</h1>
            <p>
              Esta página pertence à {marca.nome}
              {marca.razaoSocial.validado ? ` (${marca.razaoSocial.valor}, CNPJ ${marca.cnpj.valor})` : ''}. Aqui explicamos quais dados
              coletamos no formulário de cotação, para que servem e como você pode pedir a exclusão.
            </p>
            <h2>Dados que coletamos</h2>
            <p>
              Rota (UF e cidade de origem e destino), tipo de carga, peso aproximado, frequência, nome, empresa, CNPJ (opcional), WhatsApp,
              e-mail e os detalhes que você escrever. Também registramos de onde veio a visita (parâmetros de campanha como utm e gclid),
              a página de entrada, o endereço IP e o navegador, para evitar envios automáticos e medir os anúncios.
            </p>
            <h2>Para que usamos</h2>
            <p>
              Para preparar e enviar a cotação de frete que você pediu e para falar com você sobre ela. A base legal é o procedimento
              preliminar a contrato, a pedido do titular (art. 7º, V, da LGPD). Os dados de medição dos anúncios só são usados com o seu
              consentimento (art. 7º, I), dado no aviso de cookies.
            </p>
            <h2>Com quem compartilhamos</h2>
            <p>
              Com a agência que opera esta página e as campanhas (RL), com a ferramenta de automação que leva o pedido à equipe
              comercial (n8n) e com a planilha de acompanhamento dos pedidos. Se você aceitar os cookies, o Google (Google Ads e Google
              Analytics) recebe dados de navegação e, para medir a conversão, o e-mail e o telefone em formato criptografado (hash).
            </p>
            <h2>Por quanto tempo</h2>
            <p>Pelo tempo da negociação e por até 2 anos depois do último contato, salvo obrigação legal de guardar por mais tempo.</p>
            <h2>Seus direitos</h2>
            <p>
              Você pode pedir acesso, correção ou exclusão dos seus dados e revogar o consentimento a qualquer momento, pelo e-mail
              do encarregado indicado abaixo.
            </p>
            <h2>Encarregado (DPO)</h2>
            <p>{marca.email.validado ? marca.email.valor : 'Contato do encarregado a confirmar com a GMIL.'}</p>
            <p style={{ marginTop: 40 }}>
              <Link href="/">Voltar para a página de cotação</Link>
            </p>
          </article>
        </div>
      </main>
    </>
  );
}
