const paths: Record<string, string> = {
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  right: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h3"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4"/><path d="M21 12h-5v5h5"/>',
  car: '<path d="m5 7 2-4h10l2 4 2 3v8H3v-8zm-2 3h18M7 18v3m10-3v3M6 14h2m8 0h2"/>',
  home: '<path d="m3 11 9-8 9 8M5 9v12h14V9M9 21v-8h6v8"/>',
  shield: '<path d="m12 3 9 4v5c0 5-9 9-9 9s-9-4-9-9V7z"/><path d="m8 12 3 3 5-5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  growth: '<path d="M4 20h16M7 16v-5m5 5V7m5 9V3"/>',
  spark: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  link: '<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-2 2" transform="translate(1 0) scale(.9)"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
  phone: '<path d="M6 3H3v4c0 8 6 14 14 14h4v-3l-5-2-2 2a14 14 0 0 1-8-8l2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.7 7.5L3 21l1.5-4.8A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 1c-1 4-6 1-8-1s-4-6-1-7Z"/>',
  sun: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
};
export function icon(name: string, extra = '') {
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.spark}</svg>`;
}
