// Preview mostra o que ainda depende de confirmação, com tarja; produção esconde.
export const mostrarPendencias = process.env.NEXT_PUBLIC_MOSTRAR_PENDENCIAS === 'true';
export const visivel = (validado: boolean) => validado || mostrarPendencias;
