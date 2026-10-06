'use client';
import { useEffect, useRef } from 'react';
export function LineField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pointer = 0,
      target = 0,
      frame = 0,
      width = 0,
      height = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < 65; i++) {
        const t = i / 64;
        context.beginPath();
        for (let j = 0; j <= 110; j++) {
          const u = j / 110;
          const x = width * (0.1 + u * 0.8);
          const y =
            height *
            (0.5 +
              (t - 0.5) * 0.49 +
              Math.sin(u * Math.PI * 2.1 + t * 2.55 + pointer * 0.12) *
                Math.sin(u * Math.PI) *
                0.24);
          if (j === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle =
          i > 42 && i < 48
            ? 'rgba(148,77,52,.56)'
            : `rgba(62,66,58,${0.15 + Math.sin(t * Math.PI) * 0.27})`;
        context.lineWidth = 0.65;
        context.stroke();
      }
    };
    const tick = () => {
      pointer += (target - pointer) * 0.075;
      draw();
      frame =
        Math.abs(target - pointer) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const scale = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw();
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      target = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      target = 0;
      if (!frame && !reduced.matches) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, []);
  return <canvas ref={ref} className="line-field" aria-hidden="true" />;
}
