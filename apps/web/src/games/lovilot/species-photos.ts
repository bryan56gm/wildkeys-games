/**
 * Fotografía de cada especie, recogida de `assets/species/`.
 *
 * El nombre del fichero es el id de la especie (`vista.webp` → `vista`), así
 * que añadir una foto es soltarla en esa carpeta: no hay lista que mantener ni
 * import que añadir, y por tanto no hay forma de que se desincronicen.
 *
 * Van empaquetadas con la aplicación, no servidas desde fuera: el juego tiene
 * que funcionar sin red, y el service worker solo precachea lo que sale del
 * build. Una imagen de otro dominio dejaría huecos en el evento.
 */
const modules = import.meta.glob('./assets/species/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

export const speciesPhotos: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.replace(/^.*\/(.+)\.webp$/u, '$1'), url])
);
