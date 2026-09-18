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
export { Carousel, type CarouselProps } from './components/Carousel.js';
export {
  ConfirmDialog,
  type ConfirmDialogCopy,
  type ConfirmDialogProps,
} from './components/ConfirmDialog.js';
export { Confetti, type ConfettiProps } from './components/Confetti.js';
export { Dialog, type DialogPlacement, type DialogProps } from './components/Dialog.js';
export { Disclosure, type DisclosureProps } from './components/Disclosure.js';
export { IconButton, type IconButtonProps } from './components/IconButton.js';
export {
  HomeIcon,
  LockIcon,
  PlayIcon,
  ReplayIcon,
  StopwatchIcon,
  TrophyIcon,
} from './components/icons.js';
export { Kicker, type KickerProps, type KickerTone } from './components/Kicker.js';
export { PhotoViewer, type PhotoViewerProps } from './components/PhotoViewer.js';
export { PlainButton, type PlainButtonProps } from './components/PlainButton.js';
export { Pill, type PillProps, type PillTone } from './components/Pill.js';
export { ProgressBar, type ProgressBarProps } from './components/ProgressBar.js';
export { plainText, RichText, type RichTextProps } from './components/RichText.js';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedItem,
} from './components/SegmentedControl.js';
export { Stat, type StatProps } from './components/Stat.js';
export { VisuallyHidden } from './components/VisuallyHidden.js';
export { cx } from './lib/cx.js';
export { useCarousel, type CarouselControls } from './lib/use-carousel.js';
export { useVisualViewportHeight } from './lib/use-visual-viewport.js';
