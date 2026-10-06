import type { ParsedLocation } from '@tanstack/react-router';
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
export function transitionTypes({
  fromLocation,
  toLocation,
}: {
  fromLocation?: ParsedLocation;
  toLocation: ParsedLocation;
}) {
  if (prefersReducedMotion() || fromLocation?.pathname === toLocation.pathname) return false;
  const fromCase = /\/projects\/[^/]+$/.test(fromLocation?.pathname ?? '');
  const toCase = /\/projects\/[^/]+$/.test(toLocation.pathname);
  if (fromCase && toCase) return ['study-switch'];
  if (toCase) return ['study-open'];
  if (fromCase) return ['study-close'];
  const backwards = (fromLocation?.state.__TSR_index ?? 0) > (toLocation.state.__TSR_index ?? 0);
  return [backwards ? 'page-back' : 'page-forward'];
}
