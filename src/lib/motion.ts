import type { ParsedLocation } from '@tanstack/react-router';
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
export function installViewTransitionSafety() {
  if (!('startViewTransition' in document)) return;
  const native = document.startViewTransition.bind(document);
  // The Router awaits the DOM update, but currently leaves native `ready`
  // rejections unhandled. A skipped snapshot must not turn successful
  // navigation into an application error (e.g. switching tabs mid-update).
  document.startViewTransition = (...args) => {
    const transition = native(...args);
    void transition.ready.catch((error: unknown) => {
      if (
        error instanceof DOMException &&
        ['AbortError', 'InvalidStateError', 'TimeoutError'].includes(error.name)
      )
        return;
      queueMicrotask(() => {
        throw error;
      });
    });
    return transition;
  };
}
export function transitionTypes({
  fromLocation,
  toLocation,
}: {
  fromLocation?: ParsedLocation;
  toLocation: ParsedLocation;
}) {
  if (
    prefersReducedMotion() ||
    (typeof document !== 'undefined' && document.visibilityState !== 'visible') ||
    fromLocation?.pathname === toLocation.pathname
  )
    return false;
  const fromWriting = /\/writing\/[^/]+$/.test(fromLocation?.pathname ?? ''),
    toWriting = /\/writing\/[^/]+$/.test(toLocation.pathname);
  if (toLocation.pathname.endsWith('/preview')) return ['manuscript-preview'];
  if (fromLocation?.pathname.endsWith('/preview')) return ['manuscript-return'];
  if (fromWriting && toWriting) return ['writing-turn'];
  if (toWriting) return ['writing-open'];
  if (fromWriting) return ['writing-close'];
  const fromCase = /\/projects\/[^/]+$/.test(fromLocation?.pathname ?? '');
  const toCase = /\/projects\/[^/]+$/.test(toLocation.pathname);
  if (fromCase && toCase) return ['study-switch'];
  if (toCase) return ['study-open'];
  if (fromCase) return ['study-close'];
  const backwards = (fromLocation?.state.__TSR_index ?? 0) > (toLocation.state.__TSR_index ?? 0);
  return [backwards ? 'page-back' : 'page-forward'];
}
