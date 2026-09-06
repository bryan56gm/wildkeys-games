import { Dialog, IconButton } from '@wkg/ui';
import type { PhotoRef } from '../types';
import { PhotoSlot } from './PhotoSlot';
import styles from './ZoomDialog.module.css';

export interface ZoomDialogProps {
  open: boolean;
  onClose(): void;
  photo: PhotoRef;
  name: string;
  scientificName: string;
  photoLabel: string;
  hint: string;
  closeLabel: string;
}

/** Foto del objetivo a pantalla completa. Se cierra tocando fuera o con Escape. */
export function ZoomDialog({
  open,
  onClose,
  photo,
  name,
  scientificName,
  photoLabel,
  hint,
  closeLabel,
}: ZoomDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} label={photoLabel} placement="full">
      <div className={styles.head}>
        <div className={styles.names}>
          <span className={styles.name}>{name}</span>
          <span className={styles.sci}>{scientificName}</span>
        </div>
        <IconButton label={closeLabel} tone="onDark" onClick={onClose}>
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </IconButton>
      </div>

      <div className={styles.frame}>
        <PhotoSlot photo={photo} label={photoLabel} height="min(64vh, 500px)" />
      </div>

      <p className={styles.hint}>{hint}</p>
    </Dialog>
  );
}
