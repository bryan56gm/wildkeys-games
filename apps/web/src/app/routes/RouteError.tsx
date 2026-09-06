import type { ReactNode } from 'react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { usePlatformCopy } from '@/app/i18n/platform-copy';
import styles from './RouteError.module.css';

/** Marco común de las pantallas de error: mensaje y salida a la portada. */
function ErrorScreen({ title, body, detail }: { title: string; body: string; detail?: ReactNode }) {
  const t = usePlatformCopy();

  return (
    <main className={styles.page} role="alert">
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>{body}</p>
      {detail ? <pre className={styles.detail}>{detail}</pre> : null}
      <Link className={styles.link} to="/">
        {t('backHome')}
      </Link>
    </main>
  );
}

/**
 * Error de una ruta. Distingue el 404 (juego que no existe) de cualquier otro
 * fallo; el detalle técnico solo se muestra en desarrollo.
 */
export function RouteError() {
  const error = useRouteError();
  const t = usePlatformCopy();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (notFound) return <ErrorScreen title={t('notFoundTitle')} body={t('notFoundBody')} />;

  return (
    <ErrorScreen
      title={t('errorTitle')}
      body={t('errorBody')}
      detail={import.meta.env.DEV ? describe(error) : undefined}
    />
  );
}

/** Ruta desconocida. */
export function NotFoundRoute() {
  const t = usePlatformCopy();
  return <ErrorScreen title={t('notFoundTitle')} body={t('notFoundBody')} />;
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.stack ?? error.message;
  return String(error);
}
