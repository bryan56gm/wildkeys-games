import { WkLogo } from '@/app/brand/WkLogo';
import styles from './BrandOutro.module.css';

export interface BrandOutroProps {
  title: string;
  body: string;
  cta: string;
  href: string;
}

/** Cierre de marca: qué es una clave dicotómica y enlace a WildKeys. */
export function BrandOutro({ title, body, cta, href }: BrandOutroProps) {
  return (
    <section className={styles.card}>
      <span className={styles.logo}>
        <WkLogo height={30} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      <a className={styles.cta} href={href} target="_blank" rel="noreferrer noopener">
        <span>{cta}</span>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </section>
  );
}
