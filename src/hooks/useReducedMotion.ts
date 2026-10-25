/**
 * The site intentionally ignores the OS "Reduce motion" setting (macOS / iOS /
 * Windows "Show animations" / Android "Remove animations") so every visitor sees
 * the same full experience. To honour the setting again, restore the
 * matchMedia('(prefers-reduced-motion: reduce)') check here — all components
 * read motion preference through this single function.
 */
export const prefersReducedMotion = (): boolean => false

export function useReducedMotion(): boolean {
  return prefersReducedMotion()
}
