/** Une clases descartando falsos. Evita traer `clsx` para diez líneas. */
export function cx(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}
