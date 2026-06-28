// SQL injection check and input cleaning utils.
// Backend is already safe with parameterized queries (Supabase client).
// This is just a client-side layer to catch bad input early and show errors
// instead of letting the server crash with a cryptic error.
// It looks for sketchy combinations (quotes near keywords, stacked queries, 
// comments) so normal text like "O'Brien" or "update" doesn't trigger it.

const INJECTION_PATTERNS: RegExp[] = [
  // quote followed by sql keyword or comment
  /['"]\s*(--|\/\*|OR\b|AND\b|UNION\b|SELECT\b|INSERT\b|UPDATE\b|DELETE\b|DROP\b|ALTER\b|EXEC\b|EXECUTE\b|CREATE\b|TRUNCATE\b)/i,

  // semicolon then a destructive keyword
  /;\s*(DROP\b|DELETE\b|INSERT\b|UPDATE\b|TRUNCATE\b|ALTER\b|CREATE\b|EXEC\b|EXECUTE\b)/i,

  // union select hacks
  /\bUNION\s+(ALL\s+)?SELECT\b/i,

  // sql single-line comment
  /--[^\n]*/,

  // sql block comment
  /\/\*[\s\S]*?\*\//,

  // sql server extended stored procedures
  /\bxp_\w+/i,

  // exec procedure calls
  /\b(EXEC|EXECUTE)\s*\(/i,

  // hex bypass attempts
  /0x[0-9a-fA-F]{4,}/,

  // classic 1=1 or tautology bypasses
  /\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i,
];

// returns true if input looks like a SQL injection attempt
export function hasSqlInjection(value: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(value));
}

// checks a map of fields and returns errors for the bad ones
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

// quick helper for change handlers
export function sqlInjectionError(value: string): string {
  return hasSqlInjection(value)
    ? 'Invalid characters detected. Please remove special SQL syntax.'
    : '';
}
