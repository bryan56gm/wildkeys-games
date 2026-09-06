import type { ReactNode } from 'react';
import styles from './SegmentedControl.module.css';
import { cx } from '../lib/cx.js';

export interface SegmentedItem<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  items: readonly SegmentedItem<T>[];
  value: T;
  onChange(value: T): void;
  /** Etiqueta accesible del grupo ("Idioma", "Reto"). */
  label: string;
  size?: 'sm' | 'md';
  className?: string | undefined;
}

/**
 * Selector de una opción entre pocas: idioma en la cabecera, reto en el
 * marcador. Botones con `aria-pressed`, sin dependencias de terceros.
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  label,
  size = 'sm',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cx(styles.group, styles[size], className)} role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={cx(styles.item, item.value === value && styles.active)}
          aria-pressed={item.value === value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
