import { Button, Dialog } from '@wkg/ui';
import { WkLogo } from '@/app/brand/WkLogo';
import styles from './WelcomeDialog.module.css';

export interface WelcomeDialogProps {
  open: boolean;
  onDismiss(): void;
  copy: {
    title: string;
    body: string;
    note: string;
    button: string;
  };
}

/**
 * Bienvenida, una sola vez por dispositivo. No se puede descartar con Escape:
 * explica las reglas del intento único y hay que leerla.
 */
export function WelcomeDialog({ open, onDismiss, copy }: WelcomeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      label={copy.title}
      placement="center"
      dismissible={false}
    >
      <span className={styles.badge}>
        <WkLogo height={28} />
      </span>
      <div className={styles.text}>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.body}>{copy.body}</p>
      </div>
      <div className={styles.note}>
        <span aria-hidden="true">🍺</span>
        <p className={styles.noteText}>{copy.note}</p>
      </div>
      <Button onClick={onDismiss} size="md">
        {copy.button}
      </Button>
    </Dialog>
  );
}
