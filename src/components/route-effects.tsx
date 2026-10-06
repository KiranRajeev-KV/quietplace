import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { prefersReducedMotion } from '@/lib/motion';
export function RouteEffects() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    document.documentElement.dataset.ready = 'true';
    if (document.documentElement.dataset.initial === 'false')
      document.getElementById('main')?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-entered', 'true');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
