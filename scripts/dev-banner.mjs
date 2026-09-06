#!/usr/bin/env node
/**
 * Arrancador de `pnpm dev`.
 *
 * Vite no imprime nada cuando no hay TTY y su formato no coincide con el del
 * resto de proyectos, así que este script lanza el dev y compone él la salida
 * estándar del ecosistema: túnel, Local, Network, Environments y Ready.
 *
 * Está en un fichero y no en línea dentro de `package.json` a propósito: pnpm
 * imprime el comando antes de ejecutarlo, y un one-liner largo llena la
 * cabecera de ruido.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { networkInterfaces } from 'node:os';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'apps/web');

/** Carril propio del proyecto. Ver `srv-bryan-infra/infra/dev-tunnels.tsv`. */
const PORT = 5174;
const TUNNEL = 'https://srv-bryan.tail54a186.ts.net:8451';

const green = (text) => (process.stdout.isTTY ? '\u001b[32m' + text + '\u001b[39m' : text);

/** IP de la red local, descartando docker (172.*) y la tailnet (100.*). */
function lanAddress() {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) continue;
      if (address.address.startsWith('172.') || address.address.startsWith('100.')) continue;
      return address.address;
    }
  }
  return null;
}

/** Qué fichero de entorno va a cargar Vite. */
function environmentFile() {
  for (const name of ['.env.local', '.env']) {
    if (existsSync(join(APP, name))) return name;
  }
  return null;
}

function portIsFree(port) {
  return new Promise((resolve) => {
    const probe = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => probe.close(() => resolve(true)))
      .listen(port, '127.0.0.1');
  });
}

/** Espera a que el servidor responda de verdad, y de paso mide el arranque. */
async function waitUntilServing(port, startedAt) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      await fetch('http://127.0.0.1:' + port + '/', { signal: AbortSignal.timeout(500) });
      return Date.now() - startedAt;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return null;
}

function viteVersion() {
  try {
    const manifest = readFileSync(join(APP, 'node_modules/vite/package.json'), 'utf8');
    return JSON.parse(manifest).version;
  } catch {
    return '';
  }
}

if (!(await portIsFree(PORT))) {
  // No se mata solo: ese dev puede tener trabajo a medias en otra pestaña.
  console.error('\n✗ El puerto ' + PORT + ' ya está ocupado.\n');
  console.error('  Para liberarlo:  fuser -k ' + PORT + '/tcp && pnpm dev\n');
  process.exit(1);
}

console.log('\n🌐 Tailnet: ' + TUNNEL + '\n');

const startedAt = Date.now();
const child = spawn(join(APP, 'node_modules/.bin/vite'), ['--port', String(PORT), '--strictPort'], {
  cwd: APP,
  stdio: ['inherit', 'pipe', 'inherit'],
});

// La cabecera de Vite la componemos aquí, pero sus errores de compilación y el
// HMR se dejan pasar tal cual: son los que hacen falta mientras se trabaja.
let bannerDone = false;
child.stdout.on('data', (chunk) => {
  const text = String(chunk);
  if (!bannerDone && /Local:|ready in/i.test(text)) return;
  process.stdout.write(text);
});

const elapsed = await waitUntilServing(PORT, startedAt);
bannerDone = true;

const lan = lanAddress();
const env = environmentFile();

console.log(('⚡ Vite ' + viteVersion()).trim());
console.log('- Local:         http://localhost:' + PORT);
if (lan) console.log('- Network:       http://' + lan + ':' + PORT);
if (env) console.log('- Environments: ' + env);
console.log(
  elapsed === null ? '✗ El servidor no respondió' : green('✓') + ' Ready in ' + elapsed + 'ms\n'
);

// El hijo nunca sobrevive al padre: un dev huérfano deja el carril ocupado.
const stop = (signal) => () => child.kill(signal ?? 'SIGTERM');
process.on('exit', stop());
process.on('SIGINT', stop('SIGINT'));
process.on('SIGTERM', stop('SIGTERM'));
child.on('exit', (code) => process.exit(code ?? 0));
