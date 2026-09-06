import { useEffect, useState } from 'react';

/**
 * Altura que el teclado virtual le roba a la pantalla, en píxeles.
 *
 * Hace falta porque iOS **no** encoge el viewport de maquetación al abrir el
 * teclado: lo superpone. Un panel anclado abajo (`align-items: flex-end`) se
 * queda debajo del teclado y el usuario no ve lo que escribe. Android sí
 * redimensiona, así que allí esto devuelve 0 y no estorba.
 *
 * Se mide con `visualViewport`, que es la única API que reporta el área
 * realmente visible. Sin ella (navegadores viejos) devuelve 0: el diálogo se
 * comporta como antes, nunca peor.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      // Lo que queda por debajo del área visible es el teclado (más la barra
      // del navegador, si la hubiera).
      const hidden = window.innerHeight - viewport.height - viewport.offsetTop;
      // Por debajo de este umbral es ruido de las barras del navegador al
      // hacer scroll, no un teclado abierto.
      setInset(hidden > 80 ? Math.round(hidden) : 0);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
