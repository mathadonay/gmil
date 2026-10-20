import { Archivo } from 'next/font/google';

// Uma família variável com eixo de largura: 125 para os letreiros (como o grafismo da frota), 100 no corpo.
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--fonte',
});
