import '@fontsource-variable/manrope';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource-variable/noto-sans-arabic';
import './style.css';
import './inner-pages.css';
import './photo-fit.css';
import './decision-sections.css';
import { renderSite, serviceCards } from './view.ts';
import { applyHomeServiceImages } from './unique-images.ts';
import { readRoute, pathFor } from './routes.ts';
import { metadata, headMarkup } from './seo.ts';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contact, copy, services, type Category } from './content';
import { icon } from './icons';
import { setupPageScroll, scrollPageTo, resizePageScroll, pausePageScroll, resumePageScroll } from './scroll';
import { setupDecisionSections } from './decision-motion.ts';

gsap.registerPlugin(ScrollTrigger);
const app = document.querySelector<HTMLDivElement>('#app')!;
let { locale, page } = readRoute(new URL(location.href));
let category: Category = 'all';
let events = new AbortController();
let motion: gsap.MatchMedia | undefined;
let serviceMotion: gsap.Context | undefined;
let serviceTween: gsap.core.Tween | undefined;
let serviceGeometry = { count: 0, step: 1, distance: 0 };
let layoutTimer: number | undefined;
let cardIndex = 0;
let lastFocus: HTMLElement | null = null;
const c = () => copy[locale];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function render() {
  window.clearTimeout(layoutTimer);
  clearServiceMotion();
  motion?.revert(); events.abort();
  events = new AbortController(); category = 'all'; cardIndex = 0;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = metadata(locale,page).title;
  document.querySelectorAll('[data-page-seo], meta[name="description"], meta[name="robots"]').forEach(el=>el.remove());
  document.head.insertAdjacentHTML('beforeend', headMarkup(locale,page,import.meta.env.VITE_SITE_INDEXABLE==='true'));
  app.innerHTML = renderSite(locale,page);
  const selectedService = new URL(location.href).searchParams.get('service');
  const serviceSelect = document.querySelector<HTMLSelectElement>('#enquiry-service');
  if (serviceSelect && services.some(s=>s.id===selectedService)) serviceSelect.value=selectedService!;
  bindEvents();
  animate();
}

function on<K extends keyof HTMLElementEventMap>(element: HTMLElement | null, type: K, listener: (event: HTMLElementEventMap[K]) => void) {
  element?.addEventListener(type, listener as EventListener, { signal: events.signal });
}

function showDialog(dialog: HTMLDialogElement) {
  lastFocus = document.activeElement as HTMLElement;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  pausePageScroll();
}

function closeDialog(dialog: HTMLDialogElement) {
  dialog.close();
}

function scrollToFooter(immediate = true) {
  const footer = document.querySelector<HTMLElement>('.site-footer')!;
  const style = getComputedStyle(footer);
  const mainBottom = document.querySelector('#main')!.getBoundingClientRect().bottom + window.scrollY;
  scrollPageTo(mainBottom + parseFloat(style.marginTop) - parseFloat(style.getPropertyValue('--footer-clearance')), immediate);
}

function scrollToSection(id: string, immediate = false) {
  if (id === 'footer') { scrollToFooter(immediate); return; }
  if (!id || id === 'top') { scrollPageTo(0, immediate); return; }
  const target = document.getElementById(id);
  if (target) scrollPageTo(target.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop), immediate);
}

function bindEvents() {
  setupPageScroll(events.signal);
  const footer = document.querySelector<HTMLElement>('.site-footer')!;
  const measureFooter = () => footer.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
  const footerResize = new ResizeObserver(measureFooter);
  measureFooter();
  footerResize.observe(footer);
  // Observe the page edge: the sticky footer itself is behind the page from the start.
  const floatingContact = document.querySelector<HTMLAnchorElement>('.whatsapp-float')!;
  const footerObserver = new IntersectionObserver(([entry]) => {
    const uncovered = entry.boundingClientRect.top < (entry.rootBounds?.bottom ?? window.innerHeight);
    footer.classList.toggle('is-uncovered', uncovered);
    floatingContact.classList.toggle('is-footer-visible', uncovered);
    floatingContact.inert = uncovered;
  }, { rootMargin: '0px 0px -24px 0px' });
  footerObserver.observe(document.querySelector('.footer-boundary')!);
  events.signal.addEventListener('abort', () => { footerObserver.disconnect(); footerResize.disconnect(); }, { once: true });
  on(footer, 'focusin', event => {
    const target = event.target as HTMLElement;
    if (target.getBoundingClientRect().top < document.querySelector('#main')!.getBoundingClientRect().bottom) scrollToFooter();
  });
  window.addEventListener('hashchange', () => { if (location.hash === '#footer') scrollToFooter(); else if (location.hash && page) scrollToSection(location.hash.slice(1),true); }, { signal: events.signal });
  on(document.querySelector('.back-top'), 'click', event => {
    event.preventDefault();
    history.replaceState(null, '', '#top');
    scrollPageTo(0);
    document.querySelector<HTMLAnchorElement>('.site-header .brand')?.focus({ preventScroll: true });
  });
  const signal = events.signal;
  const menu = document.querySelector<HTMLButtonElement>('#menu-toggle')!;
  const header = document.querySelector<HTMLElement>('.site-header')!;
  function closeMenu() { header.classList.remove('mobile-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', c().menu); menu.innerHTML = icon('menu'); }
  on(menu, 'click', () => {
    const isOpen = header.classList.toggle('mobile-open');
    menu.setAttribute('aria-expanded', String(isOpen)); menu.setAttribute('aria-label', isOpen ? c().close : c().menu); menu.innerHTML = icon(isOpen ? 'close' : 'menu');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); }, { signal });
  document.addEventListener('click', event => { if (!event.composedPath().includes(header)) closeMenu(); }, { signal });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => on(link, 'click', event => {
    closeMenu();
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.hash.slice(1);
    history.pushState(null, '', `#${id || 'top'}`);
    scrollToSection(id);
    if (link.classList.contains('skip-link')) document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  }));
  on(document.querySelector('#locale-toggle'), 'click', event => {
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = document.querySelector('#main')!.getBoundingClientRect().bottom <= 160 ? 'footer' : [...document.querySelectorAll<HTMLElement>('main section[id]')].find(s => s.getBoundingClientRect().top <= 160 && s.getBoundingClientRect().bottom > 160)?.id;
    const form = document.querySelector<HTMLFormElement>('.enquiry-form')!;
    const formData = form ? new FormData(form) : new FormData();
    locale = locale === 'en' ? 'ar' : 'en';
    const url = new URL(location.href); url.pathname=pathFor(locale,page); url.searchParams.delete('lang'); history.pushState(null, '', url);
    render();
    for (const key of ['name', 'email', 'service', 'message']) {
      const input = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${key}"]`);
      if (input) input.value = String(formData.get(key) ?? '');
    }
    requestAnimationFrame(() => { scrollToSection(section ?? 'top', true); document.querySelector<HTMLButtonElement>('#locale-toggle')?.focus({ preventScroll: true }); });
  });
  document.querySelectorAll<HTMLButtonElement>('.accordion-trigger').forEach(button => on(button, 'click', () => {
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll<HTMLButtonElement>('.accordion-trigger').forEach(b => {
      const open = b === button && !wasOpen;
      b.setAttribute('aria-expanded', String(open)); b.closest('.accordion-item')?.classList.toggle('is-open', open);
      document.getElementById(b.getAttribute('aria-controls')!)!.hidden = !open;
      b.querySelector('svg')!.outerHTML = icon(open ? 'arrow' : 'plus', 'accordion-icon directional');
    });
    refreshLayout();
  }));
  document.querySelectorAll<HTMLButtonElement>('.filter-button').forEach(button => on(button, 'click', () => {
    if (category === button.dataset.category) return;
    const wasPinned = serviceTween?.scrollTrigger?.isActive;
    const stageTop = document.querySelector('.services-stage')!.getBoundingClientRect().top;
    const section = document.querySelector<HTMLElement>('.services-section')!;
    const stagePosition = section.getBoundingClientRect().top + window.scrollY + parseFloat(getComputedStyle(section).paddingTop);
    clearServiceMotion();
    category = button.dataset.category as Category;
    document.querySelectorAll('.filter-button').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    document.querySelector('.services-track')!.innerHTML = applyHomeServiceImages(serviceCards(locale, category),locale);
    const count = services.filter(s => category === 'all' || s.category === category).length;
    document.querySelector('.service-count')!.textContent = `${String(count).padStart(2, '0')} ${c().serviceCount}`;
    document.querySelector<HTMLElement>('.services-viewport')!.scrollLeft = 0;
    cardIndex = 0;
    syncServiceMotion();
    ScrollTrigger.refresh();
    // Changing pin spacing must not let scroll anchoring move the filters under the pointer.
    scrollPageTo(stagePosition - (wasPinned ? 128 : stageTop), true);
    updateServiceProgress(0);
  }));
  document.querySelectorAll<HTMLButtonElement>('.carousel-controls button').forEach(button => on(button, 'click', () => {
    const viewport = document.querySelector<HTMLElement>('.services-viewport')!;
    const cards = [...document.querySelectorAll<HTMLElement>('.service-card')];
    const nextIndex = Math.max(0, Math.min(cards.length - 1, cardIndex + (button.classList.contains('next') ? 1 : -1)));
    if (serviceTween?.scrollTrigger) {
      scrollToServiceCard(nextIndex);
    } else {
      viewport.scrollBy({ left: (button.classList.contains('next') ? 1 : -1) * (locale === 'ar' ? -1 : 1) * serviceGeometry.step, behavior: reduced() ? 'instant' : 'smooth' });
    }
    cardIndex = nextIndex;
  }));
  const viewport = document.querySelector<HTMLElement>('.services-viewport')!;
  on(viewport, 'scroll', () => {
    if (!serviceTween) updateServiceProgress(serviceGeometry.distance ? Math.abs(viewport.scrollLeft) / serviceGeometry.distance : 0);
  });
  on(document.querySelector('.services-track'), 'focusin', event => {
    if (!serviceTween) return;
    const card = (event.target as HTMLElement).closest<HTMLElement>('.service-card');
    if (!card) return;
    requestAnimationFrame(() => {
      if (signal.aborted || !serviceTween || !card.contains(document.activeElement)) return;
      const bounds = card.getBoundingClientRect();
      const visible = viewport.getBoundingClientRect();
      // Browsers can scroll an overflow:hidden viewport to focused content. Let the
      // vertical pin expose that card instead, keeping its progress and transform in sync.
      if (viewport.scrollLeft || bounds.left < visible.left - 1 || bounds.right > visible.right + 1) {
        viewport.scrollLeft = 0;
        scrollToServiceCard([...card.parentElement!.children].indexOf(card), true);
      }
    });
  });
  document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
    on(dialog.querySelector('.dialog-close'), 'click', () => closeDialog(dialog));
    on(dialog, 'click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog); } });
    on(dialog, 'close', () => { document.body.classList.remove('dialog-open'); resumePageScroll(); lastFocus?.focus({ preventScroll: true }); });
  });
  on(document.querySelector<HTMLFormElement>('.enquiry-form'), 'submit', event => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const service = services.find(s => s.id === data.get('service'))!;
    const message = `${c().name}: ${String(data.get('name')).trim()}\n${c().emailField}: ${String(data.get('email')).trim()}\n${c().serviceField}: ${service[locale].name}\n\n${String(data.get('message')).trim()}`;
    document.querySelector('#enquiry-preview')!.textContent = message;
    document.querySelector('#copy-status')!.textContent = '';
    document.querySelector<HTMLAnchorElement>('#email-draft')!.href = `mailto:${contact.email}?subject=${encodeURIComponent(`${c().enquirySubject} — ${service[locale].name}`)}&body=${encodeURIComponent(message)}`;
    document.querySelector<HTMLAnchorElement>('#whatsapp-draft')!.href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
    showDialog(document.querySelector<HTMLDialogElement>('#enquiry-dialog')!);
  });
  on(document.querySelector('#copy-enquiry'), 'click', async () => {
    try { await navigator.clipboard.writeText(document.querySelector('#enquiry-preview')!.textContent!); document.querySelector('#copy-status')!.textContent = c().copied; }
    catch { document.querySelector('#copy-status')!.textContent = c().copyError; }
  });
}

function measureServices() {
  const track = document.querySelector<HTMLElement>('.services-track')!;
  const viewport = document.querySelector<HTMLElement>('.services-viewport')!;
  serviceGeometry = {
    count: track.children.length,
    step: track.firstElementChild!.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap),
    distance: Math.max(0, track.scrollWidth - viewport.clientWidth),
  };
}

function clearServiceMotion() {
  serviceMotion?.revert();
  serviceMotion = undefined;
  serviceTween = undefined;
  document.querySelector('.services-viewport')?.classList.remove('is-pinned');
}

function syncServiceMotion() {
  if (!document.querySelector('.services-stage')) return;
  const stage = document.querySelector<HTMLElement>('.services-stage')!;
  const viewport = document.querySelector<HTMLElement>('.services-viewport')!;
  const track = document.querySelector<HTMLElement>('.services-track')!;
  measureServices();
  // Keep the original responsive fallback when the whole stage cannot fit below the header.
  const canPin = !reduced() && window.innerWidth >= 1000 && window.innerHeight >= stage.offsetHeight + 148 && serviceGeometry.distance > 0;
  if (canPin === Boolean(serviceTween)) return;
  clearServiceMotion();
  if (!canPin) return;
  viewport.scrollLeft = 0;
  viewport.classList.add('is-pinned');
  serviceMotion = gsap.context(() => {
    serviceTween = gsap.to(track, {
      x: () => (locale === 'ar' ? 1 : -1) * serviceGeometry.distance,
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'top 128px',
        end: () => `+=${serviceGeometry.distance * 1.2}`,
        pin: true,
        // Lenis already smooths wheel input; a second scrub delay makes the cards lag.
        scrub: true,
        anticipatePin: 1,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onRefreshInit: measureServices,
        onUpdate: self => updateServiceProgress(self.progress),
      },
    });
  });
}

function scrollToServiceCard(index: number, immediate = false) {
  const trigger = serviceTween?.scrollTrigger;
  if (!trigger || !serviceGeometry.distance) return;
  const progress = Math.min(1, index * serviceGeometry.step / serviceGeometry.distance);
  scrollPageTo(trigger.start + progress * (trigger.end - trigger.start), immediate);
}

function updateServiceProgress(value: number) {
  if (!document.querySelector('.service-progress')) return;
  const progress = Math.max(0, Math.min(1, value));
  const { count, step, distance } = serviceGeometry;
  const fill = document.querySelector<HTMLElement>('.service-progress span')!;
  fill.style.transform = `scaleX(${.1 + progress * .9})`;
  cardIndex = Math.min(count - 1, Math.round(progress * distance / step));
  const index = document.querySelector('.carousel-index')!;
  const label = `${String(progress >= .999 ? count : cardIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
  if (index.textContent !== label) index.textContent = label;
  document.querySelector<HTMLButtonElement>('.carousel-controls .previous')!.disabled = progress <= .001 || distance === 0;
  document.querySelector<HTMLButtonElement>('.carousel-controls .next')!.disabled = progress >= .999 || distance === 0;
}

function refreshLayout() {
  if (page) { ScrollTrigger.refresh(); resizePageScroll(); return; }
  window.clearTimeout(layoutTimer);
  layoutTimer = window.setTimeout(() => {
    const trigger = serviceTween?.scrollTrigger;
    const progress = trigger?.progress ?? 0;
    const wasPinned = trigger?.isActive;
    const previousStart = trigger?.start ?? 0;
    const previousEnd = trigger?.end ?? 0;
    // Refresh existing pin dimensions first. Only change its lifecycle at a breakpoint.
    ScrollTrigger.refresh();
    syncServiceMotion();
    ScrollTrigger.refresh();
    const current = serviceTween?.scrollTrigger;
    const geometryChanged = current && (Math.abs(current.start - previousStart) > 1 || Math.abs(current.end - previousEnd) > 1);
    if (wasPinned && current && geometryChanged) scrollPageTo(current.start + progress * (current.end - current.start), true);
    const viewport = document.querySelector<HTMLElement>('.services-viewport')!;
    if (wasPinned && !current) {
      viewport.scrollLeft = (locale === 'ar' ? -1 : 1) * progress * serviceGeometry.distance;
      scrollPageTo(document.querySelector('.services-stage')!.getBoundingClientRect().top + window.scrollY - 128, true);
    }
    updateServiceProgress(current?.progress ?? (serviceGeometry.distance ? Math.abs(viewport.scrollLeft) / serviceGeometry.distance : 0));
  }, 120);
}

function animateSections() {
  const groups = [
    ['.benefits', '.benefit-feature, .benefit-details'],
    ['.about-section', '.about-image, .about-copy'],
    ['.values-section', '.values-grid, .values-photo-grid'],
    ['.partners-section', ':scope > *'],
    ['.process-section', '.process-heading, .process-steps'],
    ['.contact-section', '.contact-grid'],
    ['.home-content-guide', '.expanded-introduction, .expanded-editorial, .expanded-questions'],
  ];
  groups.forEach(([selector, children]) => {
    const section = document.querySelector<HTMLElement>(selector)!;
    const surfaces = [...section.querySelectorAll<HTMLElement>(children)];
    // The section is a stable trigger; only its contents move. No layout/pin changes.
    surfaces.forEach(surface => surface.classList.add('scroll-surface'));
    const enter = window.innerHeight * .23;
    const exit = window.innerHeight * .14;
    const distance = section.offsetHeight + window.innerHeight * .9;
    gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 95%', end: 'bottom 5%', scrub: true, invalidateOnRefresh: true } })
      .fromTo(surfaces, { y: 42, opacity: .18 }, { y: 0, opacity: 1, duration: enter, ease: 'none' }, 0)
      .to(surfaces, { y: -24, opacity: .2, duration: exit, ease: 'none' }, distance - exit);
  });
  document.querySelectorAll<HTMLElement>('.about-image, .wide-photo').forEach(panel => {
    const clipStart=panel.dataset.photoFrame==='full'?'inset(4px 0px 0px 0px round 20px)':'inset(8% 0% 0% 0% round 20px)';
    gsap.fromTo(panel, { clipPath: clipStart }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', ease: 'none', scrollTrigger: { trigger: panel.closest('section'), start: 'top 95%', end: 'top 60%', scrub: true } });
  });
}

function animate() {
  // Pin spacing must be included before measuring the sections that follow Services.
  ScrollTrigger.addEventListener('refresh', resizePageScroll);
  events.signal.addEventListener('abort', () => ScrollTrigger.removeEventListener('refresh', resizePageScroll), { once: true });
  syncServiceMotion();
  setupDecisionSections(events.signal, refreshLayout);
  motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    if(page) {
      gsap.from('.inner-hero-copy > *, .inner-hero-centered > h1, .inner-hero-centered > p', {y:24,opacity:0,duration:.85,stagger:.09,ease:'power3.out'});
      if(document.querySelector('.inner-hero-art')) gsap.from('.inner-hero-art', {y:28,opacity:0,duration:1,ease:'power3.out'});
      document.querySelectorAll<HTMLElement>('.inner-reveal').forEach(el=>{
        gsap.fromTo(el,{y:30,opacity:.3},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:el,start:'top 96%',end:'top 76%',scrub:true}});
      });
    } else {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-eyebrow', { opacity: 0, y: 12, duration: .65 }, .1)
      .from('.hero-line', { yPercent: 115, rotate: 2, duration: 1.1, stagger: .13 }, .15)
      .from('.hero-portrait', { opacity: 0, y: 36, scale: .97, duration: 1.3 }, .3)
      .from('.hero-description, .hero-cta, .hero-footnote', { opacity: 0, y: 20, stagger: .1, duration: .9 }, .6)
      .from('.hero-side', { opacity: 0, x: locale === 'ar' ? -24 : 24, duration: 1 }, .6)
      .from('.floating-label, .hero-image-caption', { opacity: 0, y: 20, stagger: .12, duration: 1 }, .9);
    gsap.to('.float-top', { y: -9, duration: 3.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.float-bottom', { y: 8, duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    animateSections();
    document.querySelectorAll<HTMLImageElement>('[data-parallax]').forEach(img => gsap.fromTo(img, { yPercent: 0, y: -6, scale: 1 }, { yPercent: 0, y: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    gsap.to('.marquee-track', { xPercent: locale === 'ar' ? 25 : -25, repeat: -1, duration: 32, ease: 'none' });
    }
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 0, end: 'max', scrub: true } });
  });
  updateServiceProgress(0);
  window.addEventListener('resize', refreshLayout, { signal: events.signal });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', refreshLayout, { signal: events.signal });
  document.querySelectorAll<HTMLImageElement>('img').forEach(img => { if (!img.complete) img.addEventListener('load', refreshLayout, { once: true, signal: events.signal }); });
  const signal = events.signal;
  document.fonts.ready.then(() => {
    if (!signal.aborted) {
      syncServiceMotion(); ScrollTrigger.refresh();
      if (location.hash === '#footer') scrollToFooter();
      else if (location.hash) scrollToSection(location.hash.slice(1), true);
    }
  });
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const setHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 35);
  window.addEventListener('scroll', setHeader, { passive: true, signal: events.signal }); setHeader();
}

render();
if (import.meta.hot) import.meta.hot.dispose(() => { window.clearTimeout(layoutTimer); clearServiceMotion(); motion?.revert(); events.abort(); });

