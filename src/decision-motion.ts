import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function setupDecisionSections(signal: AbortSignal, refreshLayout: () => void) {
  const stage = document.querySelector<HTMLElement>('[data-decision-accordion]');
  if (!stage) return;
  const section = stage.closest<HTMLElement>('.decision-explorer')!;
  const panels = [...stage.querySelectorAll<HTMLElement>('.decision-panel')];
  const buttons = [...stage.querySelectorAll<HTMLButtonElement>('.decision-panel-trigger')];
  let active = 0;
  let lastScrollIndex = 0;
  let wide = false;
  let hasMotion = false;
  const stack = document.querySelector<HTMLElement>('.decision-stack')!;
  const notes = [...stack.querySelectorAll<HTMLElement>('.decision-note')];
  const measureStack = () => {
    // Only layer cards when every card can be read below the sticky header.
    // Longer Arabic copy and shorter viewports retain the normal document flow.
    const fits = wide && hasMotion && notes.every(note => note.offsetHeight + 204 <= window.innerHeight);
    stack.toggleAttribute('data-stack-ready', fits);
  };
  const mm = gsap.matchMedia();
  stage.dataset.accordionReady = 'true';

  const select = (index: number, animate = true) => {
    active = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => {
      const open = i === active;
      panel.dataset.active = String(open);
      buttons[i].setAttribute('aria-expanded', String(open));
      panel.querySelector<HTMLElement>('.decision-panel-body')!.inert = !open;
    });
    const progress = section.querySelector<HTMLElement>('.decision-progress i')!;
    progress.style.transform = `scaleX(${(active + 1) / panels.length})`;
    section.querySelector('.decision-current')!.textContent = `${String(active + 1).padStart(2, '0')} / 03`;
    if (wide) {
      gsap.to(panels, { flexGrow: i => i === active ? 5.5 : 1, duration: animate && hasMotion ? .65 : 0, ease: 'power3.out', overwrite: true });
    }
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index), { signal });
    button.addEventListener('keydown', event => {
      const rtl = document.documentElement.dir === 'rtl';
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + buttons.length) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + buttons.length) % buttons.length;
      else return;
      event.preventDefault();
      select(next);
      buttons[next].focus({ preventScroll: true });
    }, { signal });
  });
  stage.addEventListener('transitionend', event => {
    if (!wide && event.propertyName === 'grid-template-rows') refreshLayout();
  }, { signal });

  mm.add({ wide: '(min-width:1000px) and (min-height:650px)', motion: '(prefers-reduced-motion:no-preference)', reduced: '(prefers-reduced-motion:reduce)' }, context => {
    wide = Boolean(context.conditions?.wide);
    hasMotion = Boolean(context.conditions?.motion);
    gsap.set(panels, { clearProps: 'flexGrow' });
    select(active, false);
    if (wide && hasMotion) {
      section.dataset.scrollAccordion = 'true';
      lastScrollIndex = active;
      ScrollTrigger.create({
        id: 'decision-accordion', trigger: stage, start: 'top 128px',
        end: () => `+=${Math.max(1050, window.innerHeight * 1.4)}`,
        pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          // Scrolling must not make the currently focused body link inert.
          if (panels[active].querySelector('.decision-panel-body')?.contains(document.activeElement)) return;
          const index = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          // Manual selection remains until the user scrolls into another chapter.
          // Only widths change: the pin keeps a fixed height and stable page geometry.
          if (index !== lastScrollIndex) { lastScrollIndex = index; select(index); }
        },
      });
    } else {
      delete section.dataset.scrollAccordion;
    }
    measureStack();
    if (hasMotion) notes.forEach((note, index) => {
      gsap.fromTo(note, { y: 24, opacity: .55 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: note, start: 'top 94%', end: 'top 65%', scrub: true } });
      if (wide && index < notes.length - 1) gsap.to(note, { scale: .97, ease: 'none', scrollTrigger: { trigger: notes[index + 1], start: 'top 70%', end: 'top 38%', scrub: true } });
    });
    return () => { delete section.dataset.scrollAccordion; };
  });
  const stackObserver = new ResizeObserver(measureStack);
  notes.forEach(note => stackObserver.observe(note));
  window.addEventListener('resize', measureStack, { signal });
  signal.addEventListener('abort', () => {
    stackObserver.disconnect();
    mm.revert();
    gsap.killTweensOf(panels);
  }, { once: true });
}
