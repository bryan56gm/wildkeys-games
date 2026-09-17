import { useId, useState, type FormEvent } from 'react';
import { Button, Dialog, Kicker, PlayIcon } from '@wkg/ui';
import { SCORE_LIMITS } from '@wkg/leaderboard';
import styles from './RegistrationDialog.module.css';

export interface RegistrationCopy {
  kicker: string;
  title: string;
  body: string;
  placeholder: string;
  warning: string;
  confirm: string;
  cancel: string;
  errorShort: string;
  errorTaken: string;
}

export interface RegistrationDialogProps {
  open: boolean;
  onCancel(): void;
  /** Recibe el nombre ya normalizado. */
  onConfirm(nickname: string): void;
  isTaken(nickname: string): boolean;
  copy: RegistrationCopy;
}

/**
 * Alta del jugador antes del intento puntuable. Es un formulario de verdad:
 * el teclado móvil muestra "enviar" y Enter registra.
 */
export function RegistrationDialog({
  open,
  onCancel,
  onConfirm,
  isTaken,
  copy,
}: RegistrationDialogProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = nickname.trim().replace(/\s+/gu, ' ');

    if (value.length < SCORE_LIMITS.nicknameMinLength) return setError(copy.errorShort);
    if (isTaken(value)) return setError(copy.errorTaken);

    setError(null);
    onConfirm(value);
  };

  return (
    <Dialog open={open} onClose={onCancel} label={copy.title} placement="sheet">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.heading}>
          <Kicker tone="brand">{copy.kicker}</Kicker>
          <h2 className={styles.title}>{copy.title}</h2>
          <p className={styles.body}>{copy.body}</p>
        </div>

        <input
          id={inputId}
          className={styles.input}
          data-invalid={error ? '' : undefined}
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setError(null);
          }}
          placeholder={copy.placeholder}
          maxLength={SCORE_LIMITS.nicknameMaxLength}
          autoComplete="off"
          // Sin foco automático: en móvil el teclado saltaría encima del texto
          // antes de que al jugador le dé tiempo a leer qué se le pide.
          enterKeyHint="go"
          aria-label={copy.title}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {error ? (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.warning}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <p className={styles.warningText}>{copy.warning}</p>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="neutral" block={false} onClick={onCancel}>
            {copy.cancel}
          </Button>
          <Button type="submit" className={styles.confirm} leading={<PlayIcon size={16} />}>
            {copy.confirm}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
