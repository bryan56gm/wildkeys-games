import { compileKey } from '@wkg/game-engine';
import { localesOf } from '@wkg/i18n';
import type { GameDefinition } from './types';

/**
 * Comprobaciones de integridad de un juego, más allá de lo que puede el tipo:
 * claves válidas, ids únicos y textos del reto extra presentes en todos los
 * idiomas.
 *
 * Se ejecuta solo en desarrollo (ver `GameRoute`): en producción el coste no
 * se justifica, porque un fallo aquí no llega a publicarse si se ha abierto el
 * juego una sola vez.
 */
export function validateGameDefinition(definition: GameDefinition<string>): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  if (definition.challenges.length === 0) issues.push('El juego no declara ningún reto.');

  for (const challenge of definition.challenges) {
    if (seen.has(challenge.id)) issues.push(`Reto duplicado: "${challenge.id}".`);
    seen.add(challenge.id);

    try {
      compileKey(challenge.key);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : String(error));
    }

    if (challenge.speciesColumns < 1)
      issues.push(`"${challenge.id}" declara ${challenge.speciesColumns} columnas.`);
    if (challenge.bonus) issues.push(...missingBonusCopy(definition, challenge.id));
  }

  return issues;
}

const BONUS_KEYS = ['bonusKicker', 'bonusTitle', 'bonusSub', 'bonusCta'] as const;

function missingBonusCopy(definition: GameDefinition<string>, challengeId: string): string[] {
  const issues: string[] = [];

  for (const locale of localesOf(definition.i18n)) {
    // Por contrato los diccionarios son planos `clave -> texto`; el tipo
    // generado con plantillas no lo expresa como índice, de ahí la lectura.
    const dictionary = definition.i18n.dictionaries[locale] as unknown as
      Readonly<Record<string, string>> | undefined;
    for (const key of BONUS_KEYS) {
      if (!dictionary?.[`${challengeId}.${key}`]) {
        issues.push(`Falta el texto "${challengeId}.${key}" en el idioma "${locale}".`);
      }
    }
  }
  return issues;
}
