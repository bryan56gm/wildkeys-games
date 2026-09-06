import { useEffect } from 'react';
import { WkLogo } from '@/app/brand/WkLogo';
import styles from './SplashScreen.module.css';

export interface SplashScreenProps {
  /** Duración total antes de pasar a la portada. */
  durationMs: number;
  onDone(): void;
  sponsorName: string;
  sponsorLogoSrc?: string | undefined;
  subtitle: string;
  loadingLabel: string;
}

/**
 * Pantalla de carga de marca. Solo se ve una vez por sesión; su única lógica es
 * avisar cuando termina.
 */
export function SplashScreen({
  durationMs,
  onDone,
  sponsorName,
  sponsorLogoSrc,
  subtitle,
  loadingLabel,
}: SplashScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onDone]);

  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <div className={styles.sky} />
      <div className={styles.glow} />
      <SkylineSilhouette />
      <BineStrings />
      <div className={styles.grain} />

      <div className={styles.content}>
        <div className={styles.logos}>
          <span className={styles.logoCircle}>
            <span className={styles.wkLogo}>
              <WkLogo height={29} title="WildKeys" />
            </span>
          </span>
          <span className={styles.cross}>×</span>
          <span className={styles.logoCircle}>
            {sponsorLogoSrc ? (
              <img src={sponsorLogoSrc} alt={sponsorName} className={styles.sponsorLogo} />
            ) : null}
          </span>
        </div>

        <div className={styles.titles}>
          <span className={styles.wkName}>WildKeys</span>
          <span className={styles.separator}>
            <span className={styles.rule} />
            <span className={styles.crossSmall}>×</span>
            <span className={styles.rule} />
          </span>
          <span className={styles.sponsorName}>{sponsorName}</span>
        </div>

        <div className={styles.status}>
          <span className={styles.kicker}>{subtitle}</span>
          <span className={styles.loading}>
            <span className={`${styles.dot} wk-anim-ping-slow`} aria-hidden="true" />
            {loadingLabel}
          </span>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ animationDuration: `${durationMs}ms` }} />
        </div>
      </div>
    </div>
  );
}

/** Perfil de las lomas al fondo. */
function SkylineSilhouette() {
  return (
    <svg
      className={styles.skyline}
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 200 L0 130 C40 110 60 150 90 120 C120 90 140 140 170 115 C200 90 220 145 250 118 C280 92 300 138 330 112 C355 90 375 130 400 120 L400 200 Z"
        fill="#0b241d"
        opacity=".55"
      />
      <path
        d="M0 200 L0 160 C50 140 80 175 130 150 C180 125 210 168 260 148 C300 132 340 165 400 150 L400 200 Z"
        fill="#0d2b22"
        opacity=".75"
      />
    </svg>
  );
}

/** Lianas de lúpulo con sus conos, meciéndose. */
function BineStrings() {
  return (
    <svg className={styles.bines} viewBox="0 0 400 800" fill="none" aria-hidden="true">
      <g stroke="#173d30" strokeWidth="2.4" strokeLinecap="round" className={styles.sway}>
        <path d="M40 0 C20 120 70 200 45 320 C25 420 65 500 40 620" />
        <path d="M360 0 C380 110 335 210 358 330 C378 430 342 510 362 630" />
      </g>
      <g fill="#2f7a4f">
        <ellipse cx="34" cy="150" rx="10" ry="16" />
        <ellipse cx="58" cy="230" rx="9" ry="15" />
        <ellipse cx="30" cy="330" rx="11" ry="17" />
        <ellipse cx="52" cy="430" rx="9" ry="15" />
        <ellipse cx="366" cy="160" rx="10" ry="16" />
        <ellipse cx="344" cy="250" rx="9" ry="15" />
        <ellipse cx="370" cy="350" rx="11" ry="17" />
        <ellipse cx="348" cy="450" rx="9" ry="15" />
      </g>
    </svg>
  );
}
