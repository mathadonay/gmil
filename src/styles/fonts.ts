import { Archivo, Poppins } from 'next/font/google';

// Poppins: a mesma família dos posts da GMIL (títulos e corpo).
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--fonte',
});

// Archivo largo (eixo wdth 125): só rótulos, placas de rota e o cabeçalho da ordem, como o "TRANSPORTES" do logo.
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--fonte-larga',
  preload: false,
});
