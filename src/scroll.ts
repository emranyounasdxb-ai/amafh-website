import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let smooth: Lenis | undefined;

// Wheel input and GSAP share one clock. Native touch/keyboard scrolling stays available.
export function setupPageScroll(signal: AbortSignal) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tick = (seconds: number) => smooth?.raf(seconds * 1000);
  const clear = () => {
    gsap.ticker.remove(tick);
    smooth?.destroy();
    smooth = undefined;
  };
  const setup = () => {
    clear();
    if (preference.matches) return;
    smooth = new Lenis({
      autoRaf: false,
      lerp: .12,
      smoothWheel: true,
      wheelMultiplier: .9,
      syncTouch: false,
      anchors: false,
      prevent: node => node.matches('dialog, textarea, select, [data-lenis-prevent]'),
    });
    smooth.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(tick);
    if (document.querySelector('dialog[open]')) smooth.stop();
  };
  setup();
  preference.addEventListener('change', setup, { signal });
  signal.addEventListener('abort', clear, { once: true });
}

export function scrollPageTo(top: number, immediate = false) {
  if (smooth) {
    smooth.scrollTo(top, { immediate, duration: .9, easing: t => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top, behavior: immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}

export function resizePageScroll() { smooth?.resize(); }
export function pausePageScroll() { smooth?.stop(); }
export function resumePageScroll() { smooth?.start(); }
