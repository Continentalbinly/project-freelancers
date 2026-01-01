/**
 * Safe translation helper that returns fallback if translation is missing or equals the key
 */
export function safeT(
  t: (key: string) => string,
  key: string,
  fallback: string
): string {
  const translated = t(key);
  // If translation is empty, equals the key, or is just whitespace, return fallback
  if (!translated || translated.trim() === "" || translated === key) {
    return fallback;
  }
  return translated;
}

