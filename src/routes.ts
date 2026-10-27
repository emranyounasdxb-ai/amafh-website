import { services, type Locale } from './content.ts';

export const origin = 'https://amafhdubai.ae';
export const pages = ['', 'about', 'why-amafh', 'our-approach', 'how-it-works', 'partners', 'contact', 'workplace-policy', 'services', 'services/finance', 'services/insurance', 'services/accounts', ...services.map(s => `services/${s.id}`)] as const;
export type Page = typeof pages[number];
export const pathFor = (locale: Locale, page = '') => `/${locale}/${page ? `${page}/` : ''}`;
export function readRoute(url: URL) {
  const parts = url.pathname.split('/').filter(Boolean);
  const localized = parts[0] === 'en' || parts[0] === 'ar';
  const locale: Locale = localized ? parts[0] as Locale : url.searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const page = (localized ? parts.slice(1) : parts).join('/').replace(/index\.html$/, '').replace(/\/$/, '');
  return { locale, page, found: (pages as readonly string[]).includes(page) };
}
export const pageLabels: Record<string, readonly [string, string]> = {
  '': ['Home', 'الرئيسية'], about: ['About AMAFH', 'من نحن'], 'why-amafh': ['Why AMAFH', 'لماذا أماف'],
  'our-approach': ['Our approach', 'نهجنا'], 'how-it-works': ['How it works', 'كيف نعمل'], partners: ['Banking & insurance', 'الخدمات المصرفية والتأمين'],
  'workplace-policy': ['Workplace Policy', 'سياسة العمل من المكتب'],
  contact: ['Contact', 'تواصل معنا'], services: ['Our services', 'خدماتنا'],
  'services/finance': ['Finance', 'التمويل'], 'services/insurance': ['Insurance', 'التأمين'], 'services/accounts': ['Bank accounts', 'الحسابات المصرفية'],
  ...Object.fromEntries(services.map(s => [`services/${s.id}`, [s.en.name, s.ar.name]])),
};
export const labelFor = (page: string, locale: Locale) => pageLabels[page]?.[locale === 'en' ? 0 : 1] ?? (locale === 'en' ? 'Page not found' : 'الصفحة غير موجودة');
