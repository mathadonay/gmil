import { mostrarPendencias } from '@/lib/pendencias';

/** Envolve conteúdo com `validado: false`: tarja no preview, nada em produção. */
export function Pendente({
  validado,
  origem,
  children,
  como = 'div',
}: {
  validado: boolean;
  origem: string;
  children: React.ReactNode;
  como?: 'div' | 'span' | 'p';
}) {
  if (validado) return <>{children}</>;
  if (!mostrarPendencias) return null;
  const Tag = como;
  return (
    <Tag className="pendente" data-pendente={origem}>
      <span className="pendente__tarja">A CONFIRMAR · {origem}</span>
      {como === 'span' ? ' ' : <br />}
      {children}
    </Tag>
  );
}
