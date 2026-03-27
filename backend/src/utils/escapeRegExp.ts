/**
 * Escapa caracteres especiales de RegExp para tratar input como texto literal.
 * Evita inyección de regex y reduce riesgo de ReDoS por patrones maliciosos.
 */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export { escapeRegExp };
