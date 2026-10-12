import type { Locale } from './content.ts';
import type { Bi } from './service-details.ts';
import { decisionContent } from './decision-content.ts';
import { pathFor } from './routes.ts';
import { icon } from './icons.ts';

export function renderDecisionSections(page: string, locale: Locale) {
  const content = decisionContent[page];
  if (!content) return '';
  const t = (value: Bi) => value[locale === 'en' ? 0 : 1];
  const heading = (lines: [Bi, Bi]) => `${t(lines[0])}<br/><span class="heading-focus">${t(lines[1])}</span>`;
  const slug = page.replaceAll('/', '-') || 'home';
  const seed = [...slug].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const number = (index: number) => String(index + 1).padStart(2, '0');
  const enquiry = pathFor(locale, 'contact');
  return `<section class="decision-explorer container section-gap" id="decision-explorer" aria-labelledby="decision-explorer-title">
    <div class="decision-section-heading"><div><p class="eyebrow">${t(['A CLOSER LOOK', 'نظرة أقرب'])}</p><h2 id="decision-explorer-title">${heading(content.title)}</h2></div><p>${t(content.intro)}</p></div>
    <div class="decision-accordion" data-decision-accordion>
      ${content.panels.map((panel, index) => `<article class="decision-panel decision-theme-${index}" data-active="${index === 0}" style="--panel-order:${index}">
        <svg class="decision-art" viewBox="0 0 800 600" fill="none" aria-hidden="true" focusable="false"><g stroke="currentColor">${Array.from({ length: 7 }, (_, curve) => `<path d="M${70 + (seed % 95) + curve * 32} -80 C${610 + curve * 24} ${50 + index * 55}, ${-170 + curve * 38} ${240 + seed % 80}, ${560 + curve * 52} 720" stroke-width="${2 + curve * 2}"/>`).join('')}</g></svg>
        <h3 class="decision-panel-heading"><button type="button" class="decision-panel-trigger" id="decision-trigger-${slug}-${index}" aria-expanded="true" aria-controls="decision-body-${slug}-${index}" data-decision-index="${index}"><span class="decision-panel-number">${number(index)}</span><span class="decision-panel-label">${t(panel.title)}</span><span class="decision-panel-toggle">${icon('plus')}</span></button></h3>
        <div class="decision-panel-body" id="decision-body-${slug}-${index}" role="region" aria-labelledby="decision-trigger-${slug}-${index}"><div class="decision-panel-inner"><span class="decision-symbol" aria-hidden="true">${icon(panel.icon)}</span><p>${t(panel.text)}</p><div class="decision-panel-takeaway">${icon('check')}<span>${t(panel.takeaway)}</span></div><a class="decision-panel-link" href="${enquiry}">${t(['Discuss this with AMAFH', 'ناقش هذا مع أماف'])}${icon('arrow', 'directional')}</a></div></div>
      </article>`).join('')}
    </div>
    <div class="decision-explorer-foot"><span class="decision-scroll-hint">${t(['Scroll to explore · or choose a chapter', 'مرّر للاستكشاف أو اختر فصلاً'])}</span><span class="decision-select-hint">${t(['Choose a chapter to explore the details', 'اختر فصلاً لاستكشاف التفاصيل'])}</span><span class="decision-progress" aria-hidden="true"><i></i></span><span class="decision-current" aria-hidden="true">01 / 03</span></div>
  </section>
  <section class="decision-desk container section-gap" id="decision-desk" aria-labelledby="decision-desk-title">
    <div class="decision-desk-heading"><p class="eyebrow">${t(['YOUR NEXT STEP, CONSIDERED', 'خطوتك القادمة بتدبّر'])}</p><h2 id="decision-desk-title">${heading(content.deskTitle)}</h2><p>${t(content.deskIntro)}</p><a class="text-button" href="${enquiry}">${t(['Start a focused conversation', 'ابدأ حواراً محدداً'])}${icon('right', 'directional')}</a></div>
    <div class="decision-stack">${content.cards.map((card, index) => `<article class="decision-note decision-note-${index}" style="--note-order:${index}"><div class="decision-note-top"><span class="decision-note-number">${number(index)}<span> / 03</span></span><span class="decision-note-icon">${icon(content.panels[index].icon)}</span></div><h3>${t(card.title)}</h3><p>${t(card.text)}</p><ul>${card.points.map(point => `<li>${icon('check')}<span>${t(point)}</span></li>`).join('')}</ul><a href="${pathFor(locale, card.link)}" class="decision-note-link">${t(card.label)}${icon('arrow', 'directional')}</a></article>`).join('')}</div>
  </section>`;
}
