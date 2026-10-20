import { whatsapp } from '@/content/lp-gmil';
import { mostrarPendencias } from '@/lib/pendencias';

/** Botão fixo no canto inferior direito. Micro-conversão (whatsapp_click), nunca no lugar do formulário. */
export function WhatsAppFlutuante() {
  const temNumero = Boolean(whatsapp.numero);
  if (!temNumero && !mostrarPendencias) return null;
  const href = temNumero ? `https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(whatsapp.mensagemPadrao)}` : undefined;
  return (
    <a
      className="wpp-flutuante"
      href={href}
      target="_blank"
      rel="noopener"
      data-cta="whatsapp-flutuante"
      aria-label={whatsapp.rotulo}
      title={temNumero ? whatsapp.rotulo : 'Número do WhatsApp comercial a confirmar'}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.74A13 13 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-2 0-3.95-.54-5.65-1.56l-.4-.24-3.97 1.04 1.06-3.86-.26-.4A10.77 10.77 0 0 1 5.24 16c0-5.96 4.85-10.8 10.8-10.8 5.95 0 10.79 4.84 10.79 10.8 0 5.95-4.84 10.8-10.8 10.8Zm5.92-8.08c-.32-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.21.32-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.38-.5-2.62-1.6-.97-.87-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.21-.32.32-.54.11-.21.06-.4-.02-.57-.08-.16-.73-1.76-1-2.4-.26-.63-.53-.55-.73-.56h-.62c-.21 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.7 0 1.58 1.16 3.12 1.32 3.33.16.22 2.28 3.48 5.53 4.88.77.33 1.37.53 1.84.68.78.25 1.48.21 2.04.13.62-.1 1.92-.79 2.19-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.62-.37Z" />
      </svg>
      {!temNumero && <span className="wpp-flutuante__pendente">A CONFIRMAR · número</span>}
    </a>
  );
}
