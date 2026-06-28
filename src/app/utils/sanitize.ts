/**
 * SQL injection detection and input sanitization utilities.
 *
 * The backend already uses parameterized queries (Supabase JS client), so
 * there is no direct SQL injection risk. These checks provide defense-in-depth
 * at the client layer: catching clearly malicious input early and giving
 * users a clear, immediate error rather than a cryptic server failure.
 *
 * Detection focuses on *combinations* that strongly indicate injection
 * (e.g. a quote immediately followed by a SQL keyword, stacked statements,
 * comment sequences) rather than individual SQL words, which avoids
 * false-positives on legitimate text like "O'Brien" or "update your review".
 */

const INJECTION_PATTERNS: RegExp[] = [
  // Quote immediately followed by SQL keyword or comment marker
  /['"]\s*(--|\/\*|OR\b|AND\b|UNION\b|SELECT\b|INSERT\b|UPDATE\b|DELETE\b|DROP\b|ALTER\b|EXEC\b|EXECUTE\b|CREATE\b|TRUNCATE\b)/i,

  // Stacked statement: semicolon then a destructive keyword
  /;\s*(DROP\b|DELETE\b|INSERT\b|UPDATE\b|TRUNCATE\b|ALTER\b|CREATE\b|EXEC\b|EXECUTE\b)/i,

  // UNION-based data extraction
  /\bUNION\s+(ALL\s+)?SELECT\b/i,

  // SQL single-line comment (-- anything)
  /--[^\n]*/,

  // SQL block comment
  /\/\*[\s\S]*?\*\//,

  // SQL Server extended stored procedures
  /\bxp_\w+/i,

  // EXEC/EXECUTE with parenthesis (stored procedure calls)
  /\b(EXEC|EXECUTE)\s*\(/i,

  // Hex-encoded bypass attempts
  /0x[0-9a-fA-F]{4,}/,

  // Classic tautology: OR/AND with quoted string equality
  /\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i,
];

/**
 * Returns true if the value contains patterns that strongly indicate
 * a SQL injection attempt.
 */
export function hasSqlInjection(value: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Checks every field in a map and returns a parallel map of error strings.
 * Only fields that fail injection detection get an error entry.
 */
export function validateFieldsForInjection(
  fields: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value && hasSqlInjection(value)) {
      errors[key] = 'Invalid characters detected. Please remove special SQL syntax.';
    }
  }
  return errors;
}

/** Single-field helper used inline in change handlers. */
export function sqlInjectionError(value: string): string {
  return hasSqlInjection(value)
    ? 'Invalid characters detected. Please remove special SQL syntax.'
    : '';
}
