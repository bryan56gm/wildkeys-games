import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { givenPlayer, givenRunningAttempt, renderGame, winOpenChallenge } from '@/test/render-game';
import { lovilotGame } from '@/games/lovilot';

const mainKey = lovilotGame.challenges[0]!.key;

/**
 * El juego recorrido como lo recorre el jugador.
 *
 * Cada caso de aquí es un fallo que llegó al móvil de verdad: ninguno era de
 * lógica de juego —el motor tiene sus propios tests y estaban en verde—, sino
 * de las costuras entre la ruta, la sesión y el jugador guardado.
 */
describe('portada y partida', () => {
  it('un reto ya competido se puede repetir para mejorar el tiempo', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));

    // La pantalla de juego, no la victoria del intento anterior.
    expect(await screen.findByText(/variedades en juego/i)).toBeInTheDocument();
    expect(screen.queryByText(/felicidades/i)).not.toBeInTheDocument();
  });

  it('deja volver a jugar recién ganada la partida', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    expect(await screen.findByText(/felicidades/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /volver al inicio del juego/i }));
    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));

    // Empieza de cero: ni la victoria anterior ni la partida a medias.
    expect(await screen.findByText(/variedades en juego/i)).toBeInTheDocument();
    expect(screen.queryByText(/felicidades/i)).not.toBeInTheDocument();
    expect(screen.getByText(/quedan 6 de 6/i)).toBeInTheDocument();
  });

  it('al salir de la partida no queda cronómetro ni botón de salir', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await userEvent.click(await screen.findByRole('button', { name: /salir/i }));
    await userEvent.click(await screen.findByRole('button', { name: /salir igualmente/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /mejorar tu tiempo: vista/i })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: /salir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('el ciclo completo del evento: competir, volver y poder practicar', async () => {
    renderGame();

    // Registro y cronómetro en marcha.
    await userEvent.click(await screen.findByRole('button', { name: /empezar el reto: vista/i }));
    await userEvent.type(await screen.findByRole('textbox'), 'Equipo Lince');
    await userEvent.click(screen.getByRole('button', { name: /registrarme y empezar/i }));

    await winOpenChallenge(mainKey);
    expect(await screen.findByText(/felicidades/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /volver al inicio del juego/i }));

    // La marca queda a la vista y el reto extra se ha desbloqueado…
    expect(await screen.findByText(/tu marca:/i)).toBeInTheDocument();
    expect(screen.getByText(/reto extra/i)).toBeInTheDocument();

    // …y el reto principal se puede repetir para mejorar el tiempo.
    await userEvent.click(screen.getByRole('button', { name: /mejorar tu tiempo: vista/i }));
    expect(await screen.findByText(/variedades en juego/i)).toBeInTheDocument();
    expect(screen.getByText(/quedan 6 de 6/i)).toBeInTheDocument();
  });

  it('«jugar otra vez» empieza de cero, no reabre la partida ganada', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    await userEvent.click(await screen.findByRole('button', { name: /jugar otra vez/i }));

    expect(await screen.findByText(/quedan 6 de 6/i)).toBeInTheDocument();
    expect(screen.queryByText(/felicidades/i)).not.toBeInTheDocument();
  });

  it('el reto extra se ve desde el principio, bloqueado y explicando qué lo abre', async () => {
    renderGame();

    const slides = await screen.findAllByRole('group', { name: /reto \d de 2/i });
    expect(slides[0]).toHaveTextContent(/tu objetivo/i);
    expect(slides[1]).toHaveTextContent(/se desbloquea al identificar vista/i);
    // El botón se ve, pero apagado: enseña qué hay detrás sin dejar entrar.
    expect(
      within(slides[1]!).getByRole('button', { name: /empezar el reto: marta/i })
    ).toBeDisabled();
  });

  it('el reto extra desbloqueado encabeza el carrusel y el ya superado pasa detrás', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    const slides = await screen.findAllByRole('group', { name: /reto \d de 2/i });
    expect(slides[0]).toHaveTextContent(/reto extra/i);
    expect(slides[1]).toHaveTextContent(/tu marca:/i);
  });

  it('con un intento a medias, la portada ofrece continuarlo', async () => {
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /empezar el reto: vista/i }));
    await userEvent.type(await screen.findByRole('textbox'), 'Equipo Lince');
    await userEvent.click(screen.getByRole('button', { name: /registrarme y empezar/i }));
    await userEvent.click(await screen.findByRole('button', { name: /salir/i }));
    await userEvent.click(await screen.findByRole('button', { name: /salir igualmente/i }));

    expect(
      await screen.findByRole('button', { name: /continuar mi intento/i })
    ).toBeInTheDocument();
  });
});

describe('final de reto', () => {
  it('el resultado tiene URL propia y sobrevive a una recarga', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    const first = renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    await screen.findByText(/felicidades/i);

    const url = first.router.state.location.pathname;
    expect(url).toMatch(/\/resultado\/hop$/);

    // Como recargar en esa URL: se monta de cero, sin nada en memoria.
    first.unmount();
    renderGame(url);

    expect(await screen.findByText(/felicidades/i)).toBeInTheDocument();
    // Y no ha arrancado una partida nueva con el reloj en marcha.
    expect(screen.queryByText(/variedades en juego/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salir/i })).not.toBeInTheDocument();
  });

  it('ofrece las tres salidas: seguir con el reto extra, clasificación e inicio', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);

    expect(await screen.findByText(/y ahora qué/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceptar el reto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^clasificación$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volver al inicio$/i })).toBeInTheDocument();
  });

  it('continuar con el reto extra arranca la clave de la marta', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    await userEvent.click(screen.getByRole('button', { name: /aceptar el reto/i }));

    expect(await screen.findByText(/especies en juego/i)).toBeInTheDocument();
    expect(screen.getByText(/quedan 16 de 16/i)).toBeInTheDocument();
  });

  it('volver al inicio desde el final deja la portada limpia', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    await userEvent.click(screen.getByRole('button', { name: /volver al inicio$/i }));

    expect(await screen.findByText(/tu marca:/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /salir/i })).not.toBeInTheDocument();
  });
});

describe('mejorar tu tiempo', () => {
  it('guarda el récord personal y lo celebra sin tocar la clasificación', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);

    expect(await screen.findByText(/nuevo récord personal/i)).toBeInTheDocument();
    expect(screen.getByText(/no cambia la clasificación del evento/i)).toBeInTheDocument();
    // La marca del evento sigue siendo la del intento puntuable.
    expect(screen.queryByText(/guardado como/i)).not.toBeInTheDocument();
  });

  it('el récord queda a la vista en la portada, aparte de la marca del evento', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);
    await userEvent.click(screen.getByRole('button', { name: /volver al inicio$/i }));

    expect(await screen.findByText(/tu mejor tiempo libre:/i)).toBeInTheDocument();
    expect(screen.getByText(/tu marca:/i)).toBeInTheDocument();
  });
});

describe('sin conexión', () => {
  it('la marca no se pierde: queda en cola y se ve en el marcador como propia', async () => {
    // Los tests corren sin credenciales de Supabase, así que el marcador está
    // en modo local: es exactamente lo que le pasa a un móvil sin cobertura.
    givenRunningAttempt('Sin Cobertura', 'hop');
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /continuar mi intento/i }));
    await winOpenChallenge(mainKey);

    // La marca está guardada en el dispositivo, no perdida.
    const queued = window.localStorage.getItem('wkg.score-queue') ?? '';
    expect(queued).toContain('Sin Cobertura');

    // Y el jugador se ve en la clasificación, con su puesto.
    await userEvent.click(await screen.findByRole('button', { name: /^clasificación$/i }));
    expect(await screen.findByText('Sin Cobertura')).toBeInTheDocument();
    expect(screen.getByText(/tu posición/i)).toBeInTheDocument();
  });

  it('ofrece subirla a mano cuando vuelve la conexión', async () => {
    givenRunningAttempt('Sin Cobertura', 'hop');
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /continuar mi intento/i }));
    await winOpenChallenge(mainKey);
    await userEvent.click(await screen.findByRole('button', { name: /^clasificación$/i }));

    expect(await screen.findByRole('button', { name: /subir ahora/i })).toBeInTheDocument();
  });
});

describe('repasar el camino', () => {
  it('el camino llega desplegado en el resultado: es la chuleta, no letra pequeña', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /mejorar tu tiempo: vista/i }));
    await winOpenChallenge(mainKey);

    const path = (await screen.findByText(/el camino correcto/i)).closest('details');
    expect(path).toHaveAttribute('open');
  });

  it('no se puede consultar desde la portada: solo al terminar', async () => {
    givenPlayer('Equipo Lince', ['hop']);
    renderGame();

    await screen.findAllByRole('group', { name: /reto \d de 2/i });
    expect(screen.queryByRole('button', { name: /repasar el camino/i })).not.toBeInTheDocument();
  });
});

describe('registro', () => {
  it('no roba el foco al abrirse: el teclado del móvil no salta solo', async () => {
    renderGame();

    await userEvent.click(await screen.findByRole('button', { name: /empezar el reto: vista/i }));
    const field = await screen.findByRole('textbox');

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(field).not.toHaveFocus();
  });
});
