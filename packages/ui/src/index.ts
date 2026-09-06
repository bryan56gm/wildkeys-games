/**
 * UI kit compartido por los juegos de la plataforma.
 *
 * Los componentes solo leen tokens semánticos (`--wk-color-*`), nunca colores
 * literales: cada juego cambia su paleta redefiniendo esos tokens en su tema.
 * Importa `@wkg/ui/tokens.css` una vez en la app.
 */
export { Avatar, type AvatarProps } from './components/Avatar.js';
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './components/Button.js';
export { Card, type CardProps, type CardTone } from './components/Card.js';
export { Confetti, type ConfettiProps } from './components/Confetti.js';
export { Dialog, type DialogPlacement, type DialogProps } from './components/Dialog.js';
export { IconButton, type IconButtonProps } from './components/IconButton.js';
export { Kicker, type KickerProps, type KickerTone } from './components/Kicker.js';
export { PhotoViewer, type PhotoViewerProps } from './components/PhotoViewer.js';
export { Pill, type PillProps, type PillTone } from './components/Pill.js';
export { ProgressBar, type ProgressBarProps } from './components/ProgressBar.js';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedItem,
} from './components/SegmentedControl.js';
export { Stat, type StatProps } from './components/Stat.js';
export { VisuallyHidden } from './components/VisuallyHidden.js';
export { cx } from './lib/cx.js';
export { useKeyboardInset } from './lib/use-keyboard-inset.js';
export { usePinchZoom, type PinchZoomResult, type ZoomState } from './lib/use-pinch-zoom.js';
