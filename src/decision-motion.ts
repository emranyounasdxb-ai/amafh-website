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
  let accordionPin: ScrollTrigger | undefined;
  let accordionGeometry = '';
  const heading = section.querySelector<HTMLElement>('.decision-section-heading')!;
  const foot = section.querySelector<HTMLElement>('.decision-explorer-foot')!;
  const navigation = document.querySelector<HTMLElement>('.site-header')!;
  const pinTop = () => Math.ceil(navigation.offsetHeight + parseFloat(getComputedStyle(navigation).top) + 16);
  const clearAccordionSize = () => {
    ['--decision-height', '--decision-header-height', '--decision-body-top'].forEach(property => stage.style.removeProperty(property));
  };
  const measureCards = () => {
    // Measure every chapter at its final expanded width without changing selection
    // or focus. Long titles and translated text must fit the same stable card row.
    const probe = stage.cloneNode(true) as HTMLElement;
    probe.inert = true;
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;width:${stage.clientWidth}px;height:530px;margin:0;transform:none;`;
    probe.querySelectorAll('[id],[aria-controls],[aria-labelledby]').forEach(element => {
      ['id', 'aria-controls', 'aria-labelledby'].forEach(attribute => element.removeAttribute(attribute));
    });
    section.append(probe);
    let headerHeight = 0;
    let bodyHeight = 0;
    try {
      const copies = [...probe.querySelectorAll<HTMLElement>('.decision-panel')];
      copies.forEach((panel, index) => {
        copies.forEach((copy, i) => { copy.dataset.active = String(i === index); copy.style.flexGrow = i === index ? '5.5' : '1'; });
        const trigger = panel.querySelector<HTMLElement>('.decision-panel-trigger')!;
        const inner = panel.querySelector<HTMLElement>('.decision-panel-inner')!;
        trigger.style.height = 'auto';
        inner.style.height = 'auto';
        headerHeight = Math.max(headerHeight, trigger.getBoundingClientRect().height);
        bodyHeight = Math.max(bodyHeight, inner.getBoundingClientRect().height);
      });
    } finally { probe.remove(); }
    const bodyTop = Math.ceil(headerHeight) + 8;
    return { headerHeight: Math.ceil(headerHeight), bodyTop, height: Math.ceil(bodyTop + bodyHeight + 30 + 8) };
  };
  const sizeAccordion = () => {
    if (!wide || !hasMotion) {
      delete section.dataset.scrollAccordion;
      clearAccordionSize();
      return false;
    }
    section.dataset.scrollAccordion = 'true';
    let required = measureCards();
    const headingStyle = getComputedStyle(heading);
    const footStyle = getComputedStyle(foot);
    const surrounding = heading.offsetHeight + parseFloat(headingStyle.marginBottom) + foot.offsetHeight + parseFloat(footStyle.marginTop);
    const available = Math.floor(window.innerHeight - pinTop() - 16 - surrounding);
    const fits = required.height <= available;
    // If the complete view cannot fit, leave all text in normal document flow.
    if (!fits) { delete section.dataset.scrollAccordion; required = measureCards(); }
    const preferred = Math.min(530, Math.max(470, window.innerHeight * .62));
    const height = Math.max(required.height, fits ? Math.min(preferred, available) : preferred);
    stage.style.setProperty('--decision-height', `${Math.ceil(height)}px`);
    stage.style.setProperty('--decision-header-height', `${required.headerHeight}px`);
    stage.style.setProperty('--decision-body-top', `${required.bodyTop}px`);
    return fits;
  };
  const configureAccordion = () => {
    const fits = sizeAccordion();
    if (!fits) { accordionPin?.kill(); accordionPin = undefined; }
    else if (!accordionPin) {
      lastScrollIndex = active;
      accordionPin = ScrollTrigger.create({
        id: 'decision-accordion', trigger: section, pin: section,
        start: () => `top ${pinTop()}px`,
        // Two transitions, with a short reading hold at either end. The spacer
        // reserves exactly this travel; there is no extra trailing scroll phase.
        end: () => `+=${Math.round(stage.offsetHeight * .6 * (panels.length - 1))}`,
        pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          if (panels[active].querySelector('.decision-panel-body')?.contains(document.activeElement)) return;
          const index = Math.round(self.progress * (panels.length - 1));
          if (index !== lastScrollIndex) { lastScrollIndex = index; select(index); }
        },
      });
    }
    const geometry = `${wide}:${hasMotion}:${stage.clientWidth}:${stage.offsetHeight}:${heading.offsetHeight}:${foot.offsetHeight}:${pinTop()}:${fits}`;
    const changed = geometry !== accordionGeometry;
    accordionGeometry = geometry;
    return changed;
  };
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
    configureAccordion();
    measureStack();
    if (hasMotion) notes.forEach((note, index) => {
      gsap.fromTo(note, { y: 24, opacity: .55 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: note, start: 'top 94%', end: 'top 65%', scrub: true } });
      if (wide && index < notes.length - 1) gsap.to(note, { scale: .97, ease: 'none', scrollTrigger: { trigger: notes[index + 1], start: 'top 70%', end: 'top 38%', scrub: true } });
    });
    return () => {
      accordionPin?.kill(); accordionPin = undefined;
      delete section.dataset.scrollAccordion;
      clearAccordionSize();
    };
  });
  const stackObserver = new ResizeObserver(measureStack);
  notes.forEach(note => stackObserver.observe(note));
  const accordionObserver = new ResizeObserver(() => {
    if (wide && hasMotion && configureAccordion()) refreshLayout();
  });
  [heading, stage, navigation].forEach(element => accordionObserver.observe(element));
  document.fonts.ready.then(() => {
    if (!signal.aborted && wide && hasMotion && configureAccordion()) refreshLayout();
  });
  window.addEventListener('resize', measureStack, { signal });
  signal.addEventListener('abort', () => {
    stackObserver.disconnect();
    accordionObserver.disconnect();
    mm.revert();
    gsap.killTweensOf(panels);
  }, { once: true });
}
