import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * El entorno de prueba no implementa el `<dialog>` nativo, que es sobre lo que está construido
 * `Dialog`: sin esto, abrir cualquier diálogo revienta el test.
 */
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
  // Tampoco implementa el scroll programático que usa el carrusel.
  Element.prototype.scrollTo = function scrollTo() {};
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(cleanup);
