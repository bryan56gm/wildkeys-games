# Material del evento — WildKeys × LO VILOT

Todo lo que hace falta para llevar el juego a la cervecería.

## El código QR

Apunta directamente a la pantalla del juego, sin pasar por ninguna portada
intermedia:

```
https://games.wildkeys.io/lovilot
```

<img src="qr-lovilot.svg" alt="Código QR que abre el juego de LO VILOT" width="260">

| Fichero                            | Para qué                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------- |
| [`qr-lovilot.svg`](qr-lovilot.svg) | **Imprimir.** Vectorial: se amplía a cartel, mantel o vinilo sin pixelarse. |
| [`qr-lovilot.png`](qr-lovilot.png) | **Pantallas.** 1200 px, para redes, WhatsApp o un televisor del local.      |

Generados con corrección de errores **alta** (nivel H, 30%): un cartel se
mancha, se doble o se fotografía torcido, y aun así se lee. Ambos verificados
decodificándolos, no solo mirándolos.

En verde de marca (`#194836`) sobre blanco, con contraste de sobra para
cualquier lector.

## Al imprimirlo

- **Tamaño mínimo: 3 × 3 cm.** Por debajo, los móviles con cámara modesta
  empiezan a fallar. Para un cartel de pared, 10 cm o más.
- **Respetar el margen blanco** que ya lleva el fichero. Recortarlo pegado al
  dibujo es la causa más habitual de que un QR no se lea.
- **No colocarlo sobre fondo oscuro** ni ponerle un logotipo encima: el nivel H
  tolera algo de suciedad, pero no que se tape el centro.
- Conviene **escribir la dirección debajo** (`games.wildkeys.io/lovilot`), por
  si alguien prefiere teclearla o su cámara no lee códigos.

## Qué se encuentra quien lo escanea

Una web normal, sin instalar nada. La primera carga necesita conexión; a partir
de ahí **el juego funciona sin cobertura**, que es justo lo que hace falta en un
local lleno de gente. Ver
[ADR 003](../decisions/003-offline-first-leaderboard-supabase.md).

Conviene avisar de que **entren una vez con wifi buena** antes de empezar, para
que el teléfono se guarde el juego.

## Regenerarlo

Si algún día cambia la dirección:

```bash
npx qrcode -t svg -e H -l "#194836" -d "#ffffff" \
  -o docs/evento/qr-lovilot.svg "https://games.wildkeys.io/lovilot"

npx qrcode -e H -w 1200 -l "#194836" -d "#ffffff" \
  -o docs/evento/qr-lovilot.png "https://games.wildkeys.io/lovilot"
```

Y comprobarlo con el móvil antes de mandarlo a imprimir.
