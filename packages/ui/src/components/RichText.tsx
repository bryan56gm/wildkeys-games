import { Fragment, type ReactNode } from 'react';

export interface RichTextProps {
  /** Texto del diccionario. Lo que va entre asteriscos sale en cursiva. */
  text: string;
}

/**
 * Pinta un texto del diccionario dejando en cursiva lo que va entre
 * asteriscos: `Identifica el lúpulo *Vista*`.
 *
 * Existe porque los nombres de variedad y de especie son nombres propios de un
 * cultivar y se escriben en cursiva —igual que un nombre científico—, y eso no
 * se puede resolver partiendo la frase en trozos: cada idioma coloca el nombre
 * en un sitio distinto. Un solo símbolo, y ningún HTML del diccionario llega
 * al DOM: se parte el texto y se envuelve, nunca se interpreta.
 */
export function RichText({ text }: RichTextProps): ReactNode {
  return text.split(/\*([^*]+)\*/gu).map((chunk, index) =>
    // Los impares son lo que iba entre asteriscos.
    index % 2 === 1 ? <em key={index}>{chunk}</em> : <Fragment key={index}>{chunk}</Fragment>
  );
}
