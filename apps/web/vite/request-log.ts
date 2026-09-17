import type { Plugin } from 'vite';

/**
 * Peticiones que no dicen nada de lo que hace el jugador: los módulos que Vite
 * sirve por su cuenta, el cliente de HMR y los assets del propio bundle. Sin
 * este filtro una sola navegación imprime cientos de líneas y los logs dejan
 * de servir para nada.
 */
const NOISE =
  /^\/(@|node_modules\/|src\/)|\.(m?[jt]sx?|css|map|svg|png|jpe?g|webp|woff2?|ico)(\?|$)/;

/** Atenúa como `next dev`: solo si hay terminal, o los ANSI serían basura. */
const dim = (text: string) => (process.stdout.isTTY ? '[2m' + text + '[22m' : text);

/**
 * Logs de petición en `pnpm dev`, con el formato de Next (`GET / 200 in 12ms`).
 *
 * Vite no trae nada parecido —arranca y sirve en silencio— y sin esto no hay
 * forma de ver desde la terminal qué está pidiendo el móvil por el túnel, que
 * es justo cuando más falta hace.
 */
export function requestLog(): Plugin {
  return {
    name: 'wkg:request-log',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '/';
        if (NOISE.test(url)) return next();

        const startedAt = Date.now();
        res.once('finish', () => {
          const line = ` ${req.method} ${url} ${res.statusCode} in ${Date.now() - startedAt}ms`;
          server.config.logger.info(res.statusCode >= 400 ? line : dim(line));
        });
        next();
      });
    },
  };
}
