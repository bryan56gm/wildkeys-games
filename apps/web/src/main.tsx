import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fuentes autoalojadas: entran en el precache del service worker, así que la
// tipografía correcta está disponible sin red desde la segunda visita.
import '@fontsource-variable/inter';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/400-italic.css';
import '@fontsource/merriweather/700.css';

import '@wkg/ui/tokens.css';
import './app/styles/global.css';

import { App } from './app/App';

const container = document.querySelector('#root');
if (!container) throw new Error('Falta el contenedor #root en index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
