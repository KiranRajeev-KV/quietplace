'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { animate } from 'motion/mini';
import { motion } from '@/lib/motion';
export function MotionShell() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.dataset.ready = 'true';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    const active: ReturnType<typeof animate>[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          active.push(
            animate(
              entry.target,
              {
                opacity: [0.8, 1],
                transform: ['translateY(20px)', 'translateY(0)'],
              },
              motion.reveal,
            ),
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('[data-reveal]')
      .forEach((element) => observer.observe(element));
    const stop = () => {
      if (reduced.matches) active.forEach((animation) => animation.complete());
    };
    reduced.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      active.forEach((animation) => animation.complete());
      reduced.removeEventListener('change', stop);
    };
  }, [pathname]);
  return null;
}
