import { z } from 'zod';
import { UFS } from '@/content/lp-gmil';

const ufs = UFS.map(([u]) => u) as [string, ...string[]];

export const soDigitos = (s: string) => s.replace(/\D/g, '');

export function cnpjValido(valor: string) {
  const c = soDigitos(valor);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((acc, p, i) => acc + Number(base[i]) * p, 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(c[12]) && d2 === Number(c[13]);
}

export function whatsappValido(valor: string) {
  const d = soDigitos(valor);
  // DDD (2) + 8 ou 9 dígitos; celular com 9 começa por 9.
  return (d.length === 11 && d[2] === '9') || d.length === 10;
}

const toqueSchema = z.record(z.string(), z.string().max(500)).optional();

export const leadSchema = z.object({
  origemUF: z.enum(ufs),
  origemCidade: z.string().trim().max(80).default(''),
  destinoUF: z.enum(ufs),
  destinoCidade: z.string().trim().max(80).default(''),
  tipoCarga: z.enum(['agro', 'fertilizante', 'bebidas', 'industrializada', 'outra']),
  faixaPeso: z.enum(['ate14', '14a27', '27a37', 'acima37', 'nao-sei']),
  frequencia: z.enum(['pontual', 'recorrente', 'bid']),
  nome: z.string().trim().min(2).max(100),
  empresa: z.string().trim().min(2).max(120),
  cnpj: z
    .string()
    .trim()
    .max(20)
    .default('')
    .refine((v) => v === '' || cnpjValido(v), 'cnpj'),
  whatsapp: z.string().trim().refine(whatsappValido, 'whatsapp'),
  email: z.email().max(160),
  obs: z.string().trim().max(1000).default(''),
  aceite: z.literal(true),
  // Controle
  eventId: z.uuid(),
  variante: z.string().max(60),
  inicio: z.number().int(),
  site: z.string().max(200).default(''), // honeypot: humano não vê este campo
  origem: z
    .object({ canal: z.string().max(60), primeiro: toqueSchema, ultimo: toqueSchema })
    .nullable()
    .optional(),
});

export type Lead = z.infer<typeof leadSchema>;
