import { useEffect, useState } from 'react';

/**
 * Alto del área realmente visible, en píxeles, o `null` si el navegador no lo
 * sabe decir.
 *
 * Es lo que hace falta para convivir con el teclado virtual: iOS **no** encoge
 * la página al abrirlo, la tapa. Un diálogo que ocupe "toda la pantalla" queda
 * medio debajo del teclado y el usuario no ve lo que escribe.
 *
 * Se devuelve el alto —y no cuánto roba el teclado— a propósito: con el alto,
 * el diálogo se **dimensiona** al hueco libre y su contenido cae donde debe por
 * las reglas normales de maquetación. Apartarlo a base de desplazarlo era lo
 * que hacía que el formulario saltara y rebotara al escribir.
 */
export function useVisualViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => setHeight(Math.round(viewport.height));

    update();
    viewport.addEventListener('resize', update);
    return () => viewport.removeEventListener('resize', update);
  }, []);

  return height;
}
