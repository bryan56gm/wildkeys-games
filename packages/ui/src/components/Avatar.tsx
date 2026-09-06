import styles from './Avatar.module.css';
import { cx } from '../lib/cx.js';

export interface AvatarProps {
  /** Nombre del jugador; se muestra su inicial. */
  name: string;
  tone?: 'soft' | 'solid';
}

/** Inicial del jugador en un círculo. Decorativo: el nombre ya se lee al lado. */
export function Avatar({ name, tone = 'soft' }: AvatarProps) {
  return (
    <span className={cx(styles.avatar, styles[tone])} aria-hidden="true">
      {[...name.trim()][0]?.toUpperCase() ?? '?'}
    </span>
  );
}
