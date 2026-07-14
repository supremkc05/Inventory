/**
 * Lightweight className joiner — filters falsy values.
 * Prefer this over string concatenation for conditional classes.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
