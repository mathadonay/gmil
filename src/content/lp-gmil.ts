// Copy da LP de cotação da GMIL. Fonte de verdade: docs/LP-COPY.md.
// Origens: [P] prompt/variáveis 20/10/2026 · [C] Contexto_-_GMIL.md (briefing 06/10/2026) · [A] planilha das campanhas.
// Tudo com `validado: false` só aparece no preview (com tarja) e some em produção.

export type Pendente<T> = { valor: T; validado: boolean; origem: string };

export const marca = {
  nome: 'GMIL Transportes',
  razaoSocial: { valor: 'Razão social a confirmar', validado: false, origem: 'Gabriel [VALIDAR]' } as Pendente<string>,
  cnpj: { valor: 'CNPJ a confirmar', validado: false, origem: 'Gabriel [VALIDAR]' } as Pendente<string>,
  endereco: {
    valor: 'Rodovia PR-317, 5088, saída para Campo Mourão · Maringá/PR',
    validado: false,
    origem: 'Vídeo institucional 03-Gmil.mp4 (sem data); contexto cita Paiçandu [VALIDAR]',
  } as Pendente<string>,
  telefone: { valor: '(44) 3225-7262', tel: '+554432257262', validado: false, origem: 'Vídeo institucional [VALIDAR]' },
  email: { valor: 'cotacao@[domínio da GMIL]', validado: false, origem: '[C] seção 9 [VALIDAR]' } as Pendente<string>,
};

export const UFS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MG', 'Minas Gerais'],
  ['MS', 'Mato Grosso do Sul'], ['MT', 'Mato Grosso'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PE', 'Pernambuco'],
  ['PI', 'Piauí'], ['PR', 'Paraná'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'], ['RO', 'Rondônia'],
  ['RR', 'Roraima'], ['RS', 'Rio Grande do Sul'], ['SC', 'Santa Catarina'], ['SE', 'Sergipe'], ['SP', 'São Paulo'],
  ['TO', 'Tocantins'],
] as const; // Amapá fora: a GMIL não atende o AP [C] seção 4.

export type UF = (typeof UFS)[number][0];
export const nomeUF = (uf: string) => UFS.find(([s]) => s === uf)?.[1] ?? uf;
// Preposição + artigo de cada UF: "do Paraná", "da Bahia", "de São Paulo".
const ARTIGO: Partial<Record<string, 'o' | 'a' | ''>> = {
  AC: 'o', AL: '', AM: 'o', BA: 'a', CE: 'o', DF: 'o', ES: 'o', GO: '', MA: 'o', MG: '', MS: 'o', MT: 'o', PA: 'o',
  PB: 'a', PE: '', PI: 'o', PR: 'o', RJ: 'o', RN: 'o', RO: '', RR: '', RS: 'o', SC: '', SE: '', SP: '', TO: 'o',
};
export const deUF = (uf: string) => ({ o: 'do', a: 'da', '': 'de' })[ARTIGO[uf] ?? ''] + ' ' + nomeUF(uf);
export const paraUF = (uf: string) => 'para ' + (ARTIGO[uf] ? ARTIGO[uf] + ' ' : '') + nomeUF(uf);
export const ehUF = (s: string): s is UF => UFS.some(([u]) => u === s);

// As 9 UFs das campanhas, nos dois sentidos com o PR [A].
export const ROTAS_CAMPANHA: UF[] = ['SP', 'MG', 'GO', 'MT', 'MS', 'SC', 'RS', 'BA', 'ES'];

export type Variante = {
  id: string;
  campanha: 'rotas' | 'lotacao' | 'padrao';
  titulo: string;
  apoio: string;
  rota?: { origem: UF; destino: UF };
  ordemForm: 'rota-primeiro' | 'carga-primeiro';
  tipoCarga?: TipoCarga;
  frequencia?: Frequencia;
};

const APOIO_PADRAO =
  'Lotação em carreta sider, graneleiro, carroceria aberta e grade baixa. Frota própria e agregada, com base no Paraná e atendimento em todos os estados, menos o Amapá.';

export const variantesLotacao: Record<string, Omit<Variante, 'campanha' | 'ordemForm'>> = {
  lotacao: { id: 'lotacao:padrao', titulo: 'Lotação e carga fechada para indústrias e embarcadores', apoio: APOIO_PADRAO },
  sider: {
    id: 'lotacao:sider',
    titulo: 'Frete em carreta sider para carga fechada',
    apoio: 'Sider para carga industrializada, com lotação saindo e chegando ao Paraná. Também graneleiro, carroceria aberta e grade baixa.',
  },
  industria: {
    id: 'lotacao:industria',
    titulo: 'Transporte de carga industrial em lotação',
    apoio: 'Carreta sider, bitrem e rodotrem para a carga fechada da sua indústria, com base no Paraná e atendimento em todos os estados, menos o Amapá.',
    tipoCarga: 'industrializada',
  },
  fertilizante: {
    id: 'lotacao:fertilizante',
    titulo: 'Transporte de fertilizante em carga fechada',
    apoio: 'Fertilizante e adubo em lotação, em sider ou graneleiro, saindo e chegando ao Paraná.',
    tipoCarga: 'fertilizante',
  },
  bebidas: {
    id: 'lotacao:bebidas',
    titulo: 'Transporte de bebidas em carreta sider',
    apoio: 'Cerveja e outras bebidas em carga fechada, com carreta sider e base no Paraná.',
    tipoCarga: 'bebidas',
  },
  bid: {
    id: 'lotacao:bid',
    titulo: 'Transportadora para o seu BID de lotação',
    apoio: 'Informe as rotas e os volumes da concorrência. A equipe comercial analisa rota, carga, custo e viabilidade e retorna com a proposta.',
    frequencia: 'bid',
  },
};

export const varianteRotasPadrao = {
  id: 'rotas:padrao',
  titulo: 'Cargas completas saindo e chegando ao Paraná',
  apoio: APOIO_PADRAO,
};

export function tituloRota(origem: UF, destino: UF) {
  return {
    id: `rotas:${origem.toLowerCase()}-${destino.toLowerCase()}`,
    titulo: `Transportadora ${origem} ⇄ ${destino} para carga completa`,
    apoio: `Lotação ${deUF(origem)} ${paraUF(destino)} e de volta, com frota própria e agregada e base no Paraná.`,
  };
}

export const hero = {
  rotulo: 'Lotação · carga fechada · base no Paraná',
  fatos: [
    'Truck, carreta, bitrem e rodotrem',
    'Sider, graneleiro, aberta e grade baixa',
    'Rastreamento da carga',
  ],
  slides: [
    { src: '/fotos/hero/01-sider-noite.jpg', alt: 'Cavalo Volvo prata da GMIL com carreta sider de lona preta e o logo GMIL, à noite' },
    { src: '/fotos/hero/02-sider-dia.jpg', alt: 'Conjunto sider da GMIL com cavalo prata número 001 estacionado no pátio' },
    { src: '/fotos/hero/03-estrada.jpg', alt: 'Carreta sider da GMIL na estrada ao pôr do sol' },
    { src: '/fotos/hero/04-sider-patio.jpg', alt: 'Cavalo prata e carreta sider da GMIL vistos de lado, com a lona preta e o logo' },
    { src: '/fotos/hero/05-cavalos.jpg', alt: 'Três cavalos Volvo da GMIL lado a lado, nas cores azul-petróleo, laranja e prata' },
  ],
};

export const cta = {
  texto: 'Pedir minha cotação',
  risco: 'Sem compromisso. A equipe comercial analisa rota, carga, custo e viabilidade e responde por WhatsApp ou e-mail.',
  prazo: { valor: 'Retorno em até [X] horas úteis.', validado: false, origem: 'Prazo não confirmado pelo Gabriel [VALIDAR]' } as Pendente<string>,
};

export type TipoCarga = 'agro' | 'fertilizante' | 'bebidas' | 'industrializada' | 'outra';
export type FaixaPeso = 'ate14' | '14a27' | '27a37' | 'acima37' | 'nao-sei';
export type Frequencia = 'pontual' | 'recorrente' | 'bid';

export const form = {
  titulo: 'Ordem de cotação',
  resumo: '3 etapas · cerca de 1 minuto',
  paraQuem: 'Para embarcadores e indústrias. Não atendemos carga fracionada nem mudança.',
  etapas: { rota: 'Rota', carga: 'Carga', contato: 'Contato' },
  rota: {
    origem: 'Origem',
    destino: 'Destino',
    uf: 'UF',
    cidade: 'Cidade',
    cidadePlaceholder: 'Ex.: Maringá',
    inverter: 'Inverter sentido',
    ajuda: 'Atendemos todos os estados, menos o Amapá.',
  },
  carga: {
    tipo: 'Tipo de carga',
    tipos: [
      ['agro', 'Agro / grãos'],
      ['fertilizante', 'Fertilizante'],
      ['bebidas', 'Bebidas'],
      ['industrializada', 'Industrializada'],
      ['outra', 'Outra'],
    ] as [TipoCarga, string][],
    peso: 'Peso aproximado por carga',
    pesos: [
      ['ate14', 'Até 14 t'],
      ['14a27', '14 a 27 t'],
      ['27a37', '27 a 37 t'],
      ['acima37', 'Acima de 37 t'],
      ['nao-sei', 'Ainda não sei'],
    ] as [FaixaPeso, string][],
    frequencia: 'Frequência',
    frequencias: [
      ['pontual', 'Carga pontual'],
      ['recorrente', 'Recorrente'],
      ['bid', 'BID / concorrência'],
    ] as [Frequencia, string][],
  },
  contato: {
    nome: 'Seu nome',
    empresa: 'Empresa',
    cnpj: 'CNPJ',
    cnpjAjuda: 'Opcional. Ajuda a equipe a preparar a proposta.',
    whatsapp: 'WhatsApp',
    whatsappPlaceholder: '(44) 99999-9999',
    email: 'E-mail corporativo',
    emailPlaceholder: 'voce@empresa.com.br',
    obs: 'Detalhes da carga',
    obsPlaceholder: 'Opcional. Ex.: embalagem, data prevista de coleta, implemento preferido.',
    aceite: 'Concordo com o uso dos meus dados para receber esta cotação, conforme a',
    aceiteLink: 'política de privacidade',
  },
  continuar: 'Continuar',
  voltar: 'Voltar',
  enviando: 'Enviando…',
  erros: {
    uf: 'Escolha a UF.',
    mesmaUF: 'Origem e destino na mesma UF? Confira se a rota está certa.',
    tipo: 'Escolha o tipo de carga.',
    peso: 'Escolha uma faixa de peso.',
    frequencia: 'Escolha a frequência.',
    nome: 'Escreva o seu nome.',
    empresa: 'Escreva o nome da empresa.',
    cnpj: 'Este CNPJ não parece válido. Confira os 14 números.',
    whatsapp: 'Informe um WhatsApp com DDD.',
    email: 'Informe um e-mail válido.',
    aceite: 'Para enviar, é preciso concordar com a política de privacidade.',
    envio: 'Não conseguimos enviar agora. Tente de novo em instantes ou fale com a equipe pelo WhatsApp.',
    rapido: 'Opa, foi rápido demais. Confira os dados e envie de novo.',
  },
};

export const frota = {
  rotulo: 'A frota',
  titulo: 'Caminhão certo para carga fechada',
  texto: 'Frota própria e agregada, com cavalos padronizados e implementos para carga industrializada e agro.',
  ficha: [
    { item: 'Veículos', valor: 'Truck · carreta · bitrem · rodotrem' },
    { item: 'Implementos', valor: 'Sider · graneleiro (grade alta) · carroceria aberta · grade baixa' },
    { item: 'Modalidade', valor: 'Lotação (carga fechada), por rota' },
    { item: 'Acompanhamento', valor: 'Rastreamento da carga' },
  ],
  naoFazemos: {
    titulo: 'Para não perder o seu tempo, não fazemos:',
    itens: ['carga fracionada', 'tanque', 'container', 'câmara fria', 'prancha', 'mudança'],
  },
  fotos: {
    cavalos: 'Três cavalos Volvo da GMIL lado a lado, nas cores azul-petróleo, laranja e prata',
    carregado: 'Carreta sider da GMIL com a lona aberta, carregada de bobinas, à noite',
    estrada: 'Conjunto sider da GMIL na estrada ao pôr do sol',
  },
  seguranca: {
    valor: 'Seguro de carga, ambiental, de responsabilidade civil e contra roubo; monitoramento 24 horas; rastreamento Sascar e Trackerlog.',
    validado: false,
    origem: '[C] seção 3: citado no briefing, sem confirmação escrita [VALIDAR]',
  } as Pendente<string>,
};

export const rotas = {
  rotulo: 'Os dois sentidos',
  titulo: 'Saindo e chegando ao Paraná',
  texto: 'A base fica no Paraná e a frota roda nos dois sentidos, com carga completa na ida e na volta.',
  outras: 'Também atendemos os demais estados, menos o Amapá.',
  dica: 'Clique na sua rota: a origem e o destino já entram na ordem de cotação.',
};

export const processo = {
  rotulo: 'Como sai a sua cotação',
  passos: [
    { titulo: 'Você envia a ordem', texto: 'Rota, tipo de carga, peso e frequência. Leva cerca de 1 minuto.' },
    { titulo: 'O comercial analisa', texto: 'Rota, carga, custo e viabilidade, antes de passar preço.' },
    { titulo: 'Você recebe a proposta', texto: 'Por WhatsApp ou e-mail, com o equipamento indicado para a carga.' },
  ],
  diferencial: {
    valor: 'Quando a fábrica atrasa e a carga é urgente, a equipe se antecipa para cumprir o prazo e avisa o cliente depois de resolver.',
    validado: false,
    origem: '[C] seção 6, fala do Nandão no briefing [VALIDAR texto]',
  } as Pendente<string>,
};

export const provaSocial = {
  validado: false,
  origem: 'Não há depoimentos nem logos autorizados [C] seção 6 e 9',
  aviso: 'Espaço reservado para depoimentos reais de embarcadores, com nome, cargo e empresa, após autorização.',
};

export const fechamento = {
  titulo: 'Tem carga fechada para cotar?',
  texto: 'Envie a rota e a carga. A equipe comercial da GMIL retorna com a análise.',
  foto: 'Cavalo roxo da GMIL carregando carreta sider aberta na frente de uma indústria',
};

export const whatsapp = {
  numero: process.env.NEXT_PUBLIC_WHATSAPP ?? '',
  rotulo: 'Falar no WhatsApp',
  mensagemPadrao: 'Olá, GMIL! Vim pela página de cotação e quero cotar uma carga fechada.',
};

export const obrigado = {
  titulo: 'Ordem de cotação recebida',
  texto: 'A equipe comercial da GMIL vai analisar a rota e a carga e responder por WhatsApp ou e-mail.',
  proximo: 'Quer adiantar? Envie os mesmos dados pelo WhatsApp comercial.',
};
