# LP de cotação · GMIL Transportes

Landing page de tráfego pago (Google Search, desktop) para cotação de carga fechada da GMIL Transportes. Projeto da RL, conduzido por Matheus Nedir.

- **Preview:** https://gmil.nedir.com.br (noindex)
- **Domínio final:** `cotacao.[domínio da GMIL]` (a confirmar)

## Stack

Next.js 16 (App Router) · TypeScript strict · CSS com tokens (`src/styles/globals.css`) · Poppins + Archivo via `next/font` · zod.

## Onde está cada coisa

| Caminho | O que é |
|---|---|
| `src/content/lp-gmil.ts` | Toda a copy, as variantes por campanha/palavra-chave e as perguntas do formulário. Itens com `validado: false` só aparecem no preview |
| `src/lib/variante.ts` | Escolhe o título pela `utm_campaign`/`utm_term` ou por `?v=` (ex.: `?v=pr-sp`, `?v=lotacao-bid`) |
| `src/components/form/LeadForm.tsx` | Ordem de cotação em 3 etapas |
| `src/app/api/lead/route.ts` + `src/lib/servidor-lead.ts` | Recebe o lead, anti-spam, grava em fila e envia ao webhook n8n |
| `src/lib/attribution.ts`, `src/lib/analytics.ts` | UTMs e click ids por 30 dias; eventos do `dataLayer` |
| `deploy/` | Serviço systemd, nginx e `publicar.sh` (release, rollback, list) |
| `docs/` | Inventário, estratégia, entrega v1 e pendências |

## Rodar localmente

```bash
npm ci
NEXT_PUBLIC_MOSTRAR_PENDENCIAS=true npm run dev
```

## Publicar o preview (na VPS)

```bash
bash deploy/publicar.sh            # nova versão
bash deploy/publicar.sh rollback   # volta para a anterior
```

Variáveis do build: `SITE_URL`, `MOSTRAR_PENDENCIAS` (true no preview, false no domínio do cliente), `WHATSAPP`, `GTM_ID`. Segredos do servidor em `/etc/gmil-lp.env`: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_TOKEN`, `FILA_TOKEN`.
