# LP GMIL · versão 1 (20/10/2026, reunião de ativação)

Fases 2 a 5 feitas de uma vez, a pedido do Matheus ("vamos tentar liberar logo a landing page"). Os portões 2 a 5 viram esta revisão única.

## Conceito: "Lona e ordem de cotação"

- **Lona:** a página é a lateral de uma carreta sider da GMIL. Fundo preto de lona com cintas verticais a cada 112 px e uma fileira de catracas na base de cada dobra escura. Vem das fotos: a lona preta com o logo enorme é a peça mais reconhecível da frota.
- **Letras largas:** Archivo variável com eixo de largura. Largura 125 nos letreiros (como "T R A N S P O R T E S" no logo e o grafismo dos cavalos) e 100 no corpo. Na campanha Rotas, a rota buscada aparece como placa: **PR ⇄ SP**.
- **Ordem de cotação:** o formulário é um documento em papel claro com cabeçalho preto, em 3 etapas: Rota, Carga, Contato. Na campanha Lotação, a ordem começa por Carga.
- **Momento memorável:** na dobra "Os dois sentidos", cada rota PR ⇄ UF é um botão. Ao clicar, a origem e o destino são preenchidos e a página volta ao formulário. Isso mostra a oferta (carga nos dois sentidos) sem acrescentar passo nenhum.
- **Cor de ação:** o laranja #F5821F do logo só aparece nos botões de conversão. Seleções do formulário usam o preto da marca.
- **Imagem:** só fotos reais da frota com a marca GMIL. Placa desfocada e marca-d'água recortada. As fotos das outras empresas do grupo ficaram de fora.

Fica fora da CARTEIRA: sem mapa, sem contador, sem fonte Inter/Outfit/Jakarta, sem capítulos em mono, sem cards iguais com ícones.

## Roteiro

| # | Dobra | Trabalho na decisão | CTA |
|---|---|---|---|
| 1 | Primeira dobra (lona): título por variante, apoio, 3 fatos, foto real e ordem de cotação aberta | Relevância + ação | Formulário |
| 2 | A frota (papel): ficha técnica, "não fazemos", 3 fotos | Crença: têm o caminhão certo; filtra o anti-perfil | — |
| 3 | Os dois sentidos (lona): 18 botões de rota | Relevância da rota e reforço da oferta | Botões de rota + "Pedir minha cotação" |
| 4 | Como sai a sua cotação (papel): 3 passos | Redução de risco: análise antes do preço | — |
| 5 | Prova social | Fica oculta até haver depoimentos reais (`validado: false`) | — |
| 6 | Fechamento (lona) + rodapé | Ação; identidade do anunciante (exigência do Google Ads) | "Pedir minha cotação" |

## Variantes (no servidor, sem piscar)

- `utm_campaign=ROTAS` + `utm_term=transportadora pr x sp` → "Transportadora **PR ⇄ SP** para carga completa", com o formulário já preenchido com PR → SP.
- `utm_campaign=LOTACAO_INDUSTRIAL` + o termo → títulos de sider, indústria, fertilizante, bebidas ou BID (o tipo de carga ou a frequência vêm pré-selecionados).
- `?v=pr-sp`, `?v=lotacao-bid`, `?v=rotas`: força uma variante para teste e para mostrar ao cliente.

## Lead

`POST /api/lead` → zod → honeypot, tempo mínimo e limite de 5 envios por IP a cada 10 min → grava em `/var/lib/gmil-lp/leads.jsonl` → fila → webhook n8n (`N8N_WEBHOOK_URL` em `/etc/gmil-lp.env`).
- Enquanto o webhook não existir, **os leads ficam guardados na VPS** (`leads.jsonl` e `fila.json`) e são enviados quando a URL for configurada. Para reprocessar a fila: `GET /api/lead?token=FILA_TOKEN`.
- Leads suspeitos (honeypot, link no texto, e-mail de teste, palavras de motorista/agregado/mudança) ficam com `status: revisar` e não vão para o comercial.

## Mensuração

Eventos no `dataLayer`: `variant_view`, `form_view`, `form_start`, `form_step`, `form_error`, `generate_lead` (com `event_id`, respostas que qualificam e e-mail/telefone **só em SHA-256** em `enhanced_conversion_data`), `cta_click`, `whatsapp_click`, `phone_click`, `scroll_depth`. Consent Mode v2 negado por padrão; o GTM só carrega depois do aceite e se `GTM_ID` estiver configurado. Atribuição de 30 dias com primeiro e último toque, UTMs e click ids.

## Testado em 20/10/2026

- Lead completo de ponta a ponta: chegou com rota, carga, CNPJ, UTMs, gclid, canal "Google Ads" e variante. `generate_lead` disparou uma vez, sem dado pessoal em claro.
- Clique numa rota da lista preenche o formulário (GO → PR).
- Erro de validação no aceite; mensagens por campo.
- Sem rolagem horizontal em 360 e 375 px; CTA visível sem rolar no celular; desktop 1440×900 com o formulário inteiro na primeira dobra.
- Bug corrigido: "Continuar" virava "Enviar" no mesmo clique e mostrava erros na etapa 3.

**Não testado ainda:** Lighthouse, GTM Preview (não há GTM), webhook n8n (não existe), leitor de tela.

## Publicação

Preview: `https://gmil.nedir.com.br` (noindex, robots.txt bloqueando tudo, sem senha para o Gabriel abrir na reunião).
- Serviço `gmil-lp` (systemd, usuário `gmil`, porta 3020). Releases em `/srv/gmil-lp/releases`, symlink `current`.
- Publicar: `bash /srv/gmil/deploy/publicar.sh` · voltar: `... rollback` · listar: `... list`.
- Domínio final `cotacao.[domínio da GMIL]`: publicar com `MOSTRAR_PENDENCIAS=false SITE_URL=https://cotacao...` e mexer **só** no A/CNAME de `cotacao` no cPanel do fornecedor.

## Pendências para ir aos anúncios

| Quem | O quê | Onde aparece |
|---|---|---|
| Matheus | CNAME `gmil` → `nedir.com.br` no DNS da Hostinger | Preview |
| Gabriel | Prazo de retorno da cotação | Embaixo do botão e no obrigado |
| Gabriel | WhatsApp comercial (número completo) | Fechamento e obrigado; `WHATSAPP=55449...` no publicar |
| Gabriel | Razão social, CNPJ, endereço atual, telefone fixo e e-mail `cotacao@` | Rodapé e privacidade (exigência do Google Ads) |
| Gabriel | Seguros, monitoramento 24 h, Sascar/Trackerlog | Dobra da frota |
| Gabriel | Frase do "antecipar o problema" (Nandão) | Dobra do processo |
| Gabriel | Depoimentos reais com autorização | Prova social |
| Gabriel | Pode citar as empresas do grupo e usar as fotos delas? | Futuro bloco de capacidade |
| Matheus | Webhook n8n + planilha; GTM e conversão "Lead Qualificado" | `/etc/gmil-lp.env` e `GTM_ID` |
| Fornecedor do site (NLS/Andrei) | CNAME `cotacao` | Domínio final |
