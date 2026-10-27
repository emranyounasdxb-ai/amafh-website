import { contact, copy, services, type Category, type Locale } from './content.ts';
import { icon } from './icons.ts';
import { pathFor, labelFor } from './routes.ts';
import { innerPage } from './inner-pages.ts';
import { campaignImage } from './images.ts';
import { renderPageExpansion } from './expanded-sections.ts';
import { applyUniqueImages } from './unique-images.ts';
import { renderDecisionSections } from './decision-sections.ts';
const categories: Category[] = ['all','finance','insurance','accounts'];
// Display the supplied artwork without its transparent canvas padding.
const wordmark = () => `<svg class="brand-logo" viewBox="307 679 1383 371" role="img" aria-label="AMAFH Commercial Brokers"><image href="/images/amafh-logo.png" width="2000" height="2000"/></svg>`;
const arrowButton = (text: string, href: string, extra = '') => `<a class="pill-button ${extra}" href="${href}"><span class="button-dot">${icon('arrow', 'directional')}</span><span>${text}</span></a>`;
function serviceVisual(service: typeof services[number], _index: number) {
  return `<div class="service-visual photo-visual campaign-service-visual">${campaignImage(service.id,'en',{decorative:true,sizes:'(max-width: 699px) 90vw, 410px'})}<span class="image-corner">${icon(service.icon)}</span></div>`;
}

export function serviceCards(locale: Locale, category: Category = 'all') {
  const c = () => copy[locale];
  const selected = services.filter(s => category === 'all' || s.category === category);
  return selected.map((service, i) => `<article class="service-card ${i === 0 ? 'accent-card' : ''}" data-service="${service.id}">
    <div class="service-card-top"><span class="outline-tag">${service[locale].label}</span><a class="service-open round-button" href="${pathFor(locale, `services/${service.id}`)}" aria-label="${c().serviceLink}: ${service[locale].name}">${icon('arrow', 'directional')}</a></div>
    <h3>${service[locale].name}</h3><p>${service[locale].description}</p>
    <a class="visual-button service-open" href="${pathFor(locale, `services/${service.id}`)}" aria-label="${c().serviceLink}: ${service[locale].name}">${serviceVisual(service, i)}</a>
    <div class="service-card-bottom"><span>${String(services.indexOf(service) + 1).padStart(2, '0')} / 08</span><a class="text-button service-open" href="${pathFor(locale, `services/${service.id}`)}">${c().serviceLink} ${icon('right', 'directional')}</a></div>
  </article>`).join('');
}


export function renderSite(locale: Locale, page = '') {
const c = () => copy[locale];
// Only trusted, local heading copy is passed here; keep the emphasis on one key phrase.
const headingFocus = (text: string, english: string, arabic: string) => {
  const word = locale === 'en' ? english : arabic;
  const phrase = text.includes(`${word}.`) ? `${word}.` : word;
  return text.replace(phrase, `<span class="heading-focus">${phrase}</span>`);
};


const t = c();
let html = `<a class="skip-link" href="#main">${t.skip}</a>
    <div class="scroll-progress" aria-hidden="true"></div>
    <svg class="clip-definitions" aria-hidden="true"><defs><clipPath id="hero-shape" clipPathUnits="objectBoundingBox"><path d="M.40,0 H.97 Q1,0 1,.04 V.96 Q1,1 .97,1 H.03 Q0,1 0,.96 V.30 Q0,.26 .04,.26 H.16 Q.20,.26 .20,.22 V.16 Q.20,.12 .24,.12 H.32 Q.36,.12 .36,.08 V.04 Q.36,0 .40,0Z"/></clipPath><clipPath id="hero-shape-rtl" clipPathUnits="objectBoundingBox"><path transform="translate(1 0) scale(-1 1)" d="M.40,0 H.97 Q1,0 1,.04 V.96 Q1,1 .97,1 H.03 Q0,1 0,.96 V.30 Q0,.26 .04,.26 H.16 Q.20,.26 .20,.22 V.16 Q.20,.12 .24,.12 H.32 Q.36,.12 .36,.08 V.04 Q.36,0 .40,0Z"/></clipPath></defs></svg>
    <header class="site-header container" id="top"><a class="brand" href="#" aria-label="AMAFH — ${locale === 'en' ? 'Home' : 'الرئيسية'}">${wordmark()}</a>
      <nav class="primary-nav" id="primary-nav" aria-label="${locale === 'en' ? 'Main navigation' : 'القائمة الرئيسية'}">${['services', 'about', 'why-amafh', 'contact'].map((id, i) => `<a href="#${id}">${t.nav[i]}${i === 0 ? icon('chevron') : ''}</a>`).join('')}</nav>
      <div class="header-actions"><button class="locale-button" id="locale-toggle" lang="${locale === 'en' ? 'ar' : 'en'}" aria-label="${locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}">${icon('globe')}<span>${locale === 'en' ? 'العربية' : 'EN'}</span></button>${arrowButton(t.talk, '#contact', 'header-cta')}<button class="menu-button" id="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="${t.menu}">${icon('menu')}</button></div>
    </header>
    <main id="main" tabindex="-1">
      <section class="hero container" aria-labelledby="hero-title">
        <div class="hero-copy"><p class="eyebrow hero-eyebrow"><span class="tiny-star">✳</span>${t.eyebrow}</p><h1 id="hero-title">${t.hero.map(line => `<span class="line-mask"><span class="hero-line">${locale === 'en' ? line.replace('chapter,', '<span class="hero-line-accent">chapter,</span>') : line}</span></span>`).join(' ')}</h1><p class="hero-description">${t.intro}</p>${arrowButton(t.explore, '#services', 'hero-cta')}<p class="hero-footnote">${t.based}<br/><span>${t.focused}</span></p></div>
        <div class="hero-media"><div class="hero-portrait">${campaignImage('hero',locale,{hero:true,className:'hero-image'})}</div><div class="floating-label float-top"><span class="float-icon">${icon('spark')}</span><span>${t.floating1}<small>AMAFH COMMERCIAL BROKERS</small></span></div><div class="floating-label float-bottom"><span class="float-icon">${icon('check')}</span><span>${t.floating2}</span></div><div class="hero-image-caption"><span class="caption-orbit">${icon('globe')}</span><span>${t.based}<br/>${t.focused}</span></div><span class="hero-photo-index" aria-hidden="true">01 — ∞</span></div>
        <aside class="hero-side"><div class="city-image">${campaignImage('dubai',locale)}<span class="glass-tag"><span>✳</span> ${t.sideLabel}</span><span class="city-coordinate" aria-hidden="true">25.2048° N<br/>55.2708° E</span></div><a class="side-cta" href="#about"><span class="large-circle">${icon('arrow', 'directional')}</span><span><strong>${t.sideTitle}</strong><small>${t.sideBody}</small></span></a></aside>
      </section>

      <section class="benefits container section-gap" id="why-amafh" aria-labelledby="benefits-title">
        <div class="benefit-feature reveal"><h2 id="benefits-title">${t.benefitTitle.map(s => `<span>${headingFocus(s, 'connection', 'تواصل')}</span>`).join(' ')}</h2><p>${t.benefitBody}</p><span class="benefit-arrow" aria-hidden="true">${icon('arrow', 'directional')}</span><div class="benefit-art" aria-hidden="true"><span class="art-star">✳</span><span class="art-label">a<span>→</span></span></div><a class="small-index text-button" href="${pathFor(locale, 'why-amafh')}">${locale === 'en' ? 'Discover the AMAFH difference' : 'اكتشف ما يميز أماف'} ${icon('right', 'directional')}</a></div>
        <div class="benefit-details reveal"><div class="benefit-heading"><span class="tag">${t.benefits}</span><div class="micro-tags">${t.benefitTabs.map(s => `<span>✳ &nbsp;${s}</span>`).join('')}</div></div><div class="accordion">${t.accordions.map((item, i) => `<div class="accordion-item ${i === 0 ? 'is-open' : ''}"><h3><button class="accordion-trigger" aria-expanded="${i === 0}" aria-controls="answer-${i}" id="question-${i}"><span>${item.title}</span>${icon(i === 0 ? 'arrow' : 'plus', 'accordion-icon directional')}</button></h3><div class="accordion-panel" id="answer-${i}" role="region" aria-labelledby="question-${i}" ${i === 0 ? '' : 'hidden'}><p>${item.text}</p></div></div>`).join('')}</div></div>
      </section>

      <section class="services-section section-gap" id="services" aria-labelledby="services-title"><div class="services-stage"><div class="container"><div class="section-heading"><div><p class="eyebrow">${t.servicesLabel}</p><h2 id="services-title">${headingFocus(t.servicesTitle.join('<br/>'), 'possible', 'الإمكانيات')}</h2></div><div class="services-heading-side"><p>${t.servicesBody}</p><div class="carousel-controls"><button class="round-button previous" aria-label="${t.prev}">${icon('right', 'directional')}</button><button class="round-button next" aria-label="${t.next}">${icon('right', 'directional')}</button></div></div></div><div class="service-filter-row"><div class="filter-buttons" aria-label="${t.footerServices}">${categories.map((cat, i) => `<button class="filter-button ${i === 0 ? 'active' : ''}" data-category="${cat}" aria-pressed="${i === 0}">${t.filters[i]}</button>`).join('')}</div><span class="service-count" aria-live="polite">08 ${t.serviceCount}</span></div></div><div class="services-viewport container"><div class="services-track">${serviceCards(locale)}</div></div><div class="container service-progress-row"><span>${t.scrollHint}</span><div class="service-progress"><span></span></div><span class="carousel-index">01 / 08</span></div></div></section>

      <section class="about-section container section-gap" id="about" aria-labelledby="about-title"><div class="about-image reveal">${campaignImage('approach',locale).replace('<img','<img data-parallax')}<div class="about-image-note">${wordmark()}${icon('arrow', 'directional')}</div></div><div class="about-copy"><span class="tag reveal">${t.aboutLabel}</span><h2 class="reveal" id="about-title">${headingFocus(t.aboutTitle.join('<br/>'), 'possibilities', 'وإمكانيات')}</h2><div class="about-description reveal"><p>${t.aboutBody}</p><p>${t.aboutBody2}</p></div>${arrowButton(t.aboutLink, pathFor(locale, 'about'), 'reveal')}<div class="stats-panel reveal">${t.stats.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div></div></section>

      <section class="values-section container section-gap" aria-label="${t.benefits}"><div class="values-grid">${t.values.map(([symbol, title, desc]) => `<article class="value-card reveal"><span class="value-icon">${icon(symbol)}</span><h3>${title}</h3><p>${desc}</p></article>`).join('')}</div><div class="values-photo-grid"><div class="wide-photo reveal">${campaignImage('mortgages',locale,{decorative:true,sizes:'(max-width: 899px) 90vw, 70vw'}).replace('<img','<img data-parallax')}<span class="glass-tag">${icon('home')} ${locale === 'en' ? 'Room for your next chapter' : 'مساحة لفصلك القادم'}</span></div><a href="${pathFor(locale, 'our-approach')}" class="accent-feature reveal"><span class="outline-tag">${t.based}</span><p>${headingFocus(locale === 'en' ? 'little steps.<br/>bigger<br/>horizons.' : 'خطوات صغيرة.<br/>وآفاق<br/>أكبر.', 'horizons', 'وآفاق')}</p><span class="feature-star" aria-hidden="true">✳</span><span class="feature-arrow">${icon('arrow', 'directional')}</span></a></div></section>

      <section class="partners-section container section-gap" id="partners" aria-labelledby="partners-title"><p class="eyebrow reveal">${t.partnerLabel}</p><h2 id="partners-title" class="reveal">${headingFocus(t.partnerTitle.replace('\n', '<br/>'), 'connections', 'العلاقات')}</h2><p class="partner-intro reveal">${t.partnerBody}</p><div class="partner-categories reveal">${t.partnerTypes.map((s, i) => `<span>${icon(['globe', 'growth', 'shield'][i])}${s}</span>`).join('')}</div>${arrowButton(locale === 'en' ? 'Explore our connections' : 'اكتشف علاقاتنا', pathFor(locale, 'partners'), 'partner-page-link')}</section>

      <div class="marquee-band" aria-hidden="true"><div class="marquee-track">${Array.from({length: 4}, () => `<span>${t.ribbon}</span><span class="marquee-star">✳</span>`).join('')}</div></div>

      <section class="process-section container section-gap" aria-labelledby="process-title"><div class="process-heading reveal"><p class="eyebrow">${t.processLabel}</p><h2 id="process-title">${headingFocus(t.processTitle.replace('\n', '<br/>'), 'what’s next', 'القادمة')}</h2>${arrowButton(locale === 'en' ? 'See how it works' : 'تعرّف على الخطوات', pathFor(locale, 'how-it-works'))}</div><div class="process-steps">${t.steps.map(([title, desc], i) => `<article class="process-step reveal"><span class="step-number">0${i + 1}</span><div><h3>${title}</h3><p>${desc}</p></div>${icon('arrow', 'directional')}</article>`).join('')}</div></section>

      ${renderPageExpansion('',locale)}
      ${renderDecisionSections('',locale)}
      <section class="contact-section section-gap" id="contact" aria-labelledby="contact-title"><div class="container contact-grid"><div class="contact-copy"><p class="eyebrow reveal">${t.contactLabel}</p><h2 class="reveal" id="contact-title">${t.contactTitle.map(s => `<span>${headingFocus(s, 'listening', 'نصغي')}</span>`).join(' ')}</h2><p class="contact-intro reveal">${t.contactBody}</p><div class="contact-methods reveal"><a href="tel:${contact.phoneHref}"><span class="contact-icon">${icon('phone')}</span><span><small>${t.phone}</small><bdi>${contact.phone}</bdi></span>${icon('arrow', 'directional')}</a><a href="mailto:${contact.email}"><span class="contact-icon">${icon('mail')}</span><span><small>${t.email}</small><bdi>${contact.email}</bdi></span>${icon('arrow', 'directional')}</a><a href="${contact.map}" target="_blank" rel="noopener noreferrer"><span class="contact-icon">${icon('pin')}</span><span><small>${t.visit}</small>${locale === 'en' ? '206, 218, Block B, Business Village<br/>Near Clock Tower, Port Saeed<br/>Deira, Dubai, UAE' : '٢٠٦، ٢١٨، بلوك ب، قرية الأعمال<br/>بالقرب من برج الساعة، بور سعيد<br/>ديرة، دبي، الإمارات'}</span>${icon('arrow', 'directional')}</a></div></div>
      <form class="enquiry-form reveal"><div class="form-top"><span class="tag">${t.talk}</span><span class="form-star" aria-hidden="true">✳</span></div><div class="form-field"><label for="enquiry-name">${t.name}</label><input id="enquiry-name" name="name" autocomplete="name" placeholder="${t.namePlaceholder}" required maxlength="100"/></div><div class="form-field"><label for="enquiry-email">${t.emailField}</label><input id="enquiry-email" name="email" type="email" autocomplete="email" placeholder="${t.emailPlaceholder}" required maxlength="200" dir="ltr"/></div><div class="form-field"><label for="enquiry-service">${t.serviceField}</label><div class="select-wrap"><select id="enquiry-service" name="service" required><option value="">${t.chooseService}</option>${services.map(s => `<option value="${s.id}">${s[locale].name}</option>`).join('')}</select>${icon('chevron')}</div></div><div class="form-field"><label for="enquiry-message">${t.message}</label><textarea id="enquiry-message" name="message" placeholder="${t.messagePlaceholder}" rows="3" maxlength="2000"></textarea></div><button class="submit-button" type="submit"><span>${t.prepare}</span><span>${icon('arrow', 'directional')}</span></button><p class="form-note">${t.formNote}</p></form></div></section>
      <div class="footer-boundary" aria-hidden="true"></div>
    </main>

    <footer class="site-footer container" id="footer">
      <section class="footer-cta" aria-labelledby="footer-cta-title">
        <div class="footer-cta-content"><h2 id="footer-cta-title">${headingFocus(t.footerCtaTitle.join('<br/>'), 'possible', 'الإمكانيات')}</h2><p>${t.footerCtaBody.replace('\n', '<br/> ')}</p><a class="footer-cta-button" href="#contact"><span>${t.footerCtaLink}</span>${icon('right', 'directional')}</a></div>
      </section>
      <div class="footer-top">
        <div class="footer-brand"><a class="brand footer-heading" href="#" aria-label="AMAFH">${wordmark()}</a><p class="footer-intro">${t.footerIntro}</p><address class="footer-address"><a href="${contact.map}" target="_blank" rel="noopener noreferrer"><span>${t.footerAddress.replaceAll('\n', '<br/>')}</span></a></address><div class="footer-shortcuts"><a href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="${t.whatsappLabel}">${icon('whatsapp')}</a><a href="mailto:${contact.email}" aria-label="${t.email}">${icon('mail')}</a><a href="tel:${contact.phoneHref}" aria-label="${t.phone}">${icon('phone')}</a><a href="${contact.map}" target="_blank" rel="noopener noreferrer" aria-label="${t.map}">${icon('pin')}</a></div></div>
        <nav class="footer-column footer-explore" aria-label="${t.footerExplore}"><h3 class="footer-heading">${t.footerExplore}</h3><div class="footer-link-list">${['services', 'about', 'why-amafh', 'contact'].map((id,i) => `<a href="#${id}">${t.nav[i]}</a>`).join('')}<a href="#partners">${t.footerPartners}</a><a href="${pathFor(locale, 'how-it-works')}">${labelFor('how-it-works',locale)}</a><a href="${pathFor(locale, 'our-approach')}">${labelFor('our-approach',locale)}</a><a href="${pathFor(locale, 'workplace-policy')}">${labelFor('workplace-policy',locale)}</a></div></nav>
        <div class="footer-column footer-services"><h3 class="footer-heading">${t.footerServices}</h3><div class="footer-service-grid">${services.map(s => `<a class="footer-service" href="${pathFor(locale, `services/${s.id}`)}">${s[locale].name}</a>`).join('')}</div><a class="footer-all-services" href="#services">${t.allServices}${icon('right', 'directional')}</a></div>
        <div class="footer-column footer-contact"><h3 class="footer-heading">${t.footerConnect}</h3><p class="footer-contact-intro">${t.footerContactIntro}</p><a class="footer-enquiry" href="#contact"><span>${t.footerEnquiry}</span><span class="footer-enquiry-button">${t.talk}${icon('right', 'directional')}</span></a><div class="footer-link-list"><a href="mailto:${contact.email}"><bdi>${contact.email}</bdi></a><a href="tel:${contact.phoneHref}"><bdi>${contact.phone}</bdi></a></div></div>
      </div>
      <div class="footer-legal"><p class="footer-disclaimer">${t.footerNote}</p></div>
      <div class="footer-bottom"><span class="footer-copyright">© ${new Date().getFullYear()} ${t.copyright}</span><span class="footer-location">${t.footerLocation}</span><a class="back-top" href="#top"><span>${t.backTop}</span>${icon('arrow')}</a></div>
    </footer>
    <a class="whatsapp-float" href="https://wa.me/${contact.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="${t.whatsappLabel}">${icon('whatsapp')}<span>${t.talk}</span></a>
    <dialog class="modal enquiry-dialog" id="enquiry-dialog" aria-labelledby="enquiry-dialog-title"><button class="dialog-close round-button" aria-label="${t.close}">${icon('close')}</button><span class="tag">AMAFH</span><h2 id="enquiry-dialog-title">${t.enquiryTitle}</h2><p>${t.enquiryReady}</p><pre id="enquiry-preview"></pre><div class="dialog-actions"><a id="email-draft" class="submit-button">${t.emailSend}${icon('arrow', 'directional')}</a><a id="whatsapp-draft" class="pill-button" target="_blank" rel="noopener noreferrer">${icon('whatsapp')}${t.whatsappSend}</a><button id="copy-enquiry" class="text-button">${t.copy}${icon('card')}</button></div><p id="copy-status" class="copy-status" role="status"></p></dialog>`;
if (page) {
 const contactStart=html.indexOf('<section class="contact-section');
 const contactEnd=html.indexOf('<div class="footer-boundary"',contactStart);
 const contactSection=html.slice(contactStart,contactEnd).replace(/<h2 class="reveal" id="contact-title">[\s\S]*?<\/h2>/, `<h2 class="reveal" id="contact-title">${locale==='en'?'tell us about<br/><span class="heading-focus">your plans.</span>':'حدثنا عن<br/><span class="heading-focus">خططك.</span>'}</h2>`);
 const start=html.indexOf('<main id="main"');
 const end=html.indexOf('</main>',start);
 html=html.slice(0,start)+'<main id="main" class="inner-page" tabindex="-1">'+innerPage(page,locale,contactSection,serviceVisual)+renderDecisionSections(page,locale)+'<div class="footer-boundary" aria-hidden="true"></div></main>'+html.slice(end+7);
}
for (const target of ['services','about','why-amafh','contact','partners']) html=html.replaceAll('href="#'+target+'"','href="'+pathFor(locale,target)+'"');
html=html.replaceAll('href="#"','href="'+pathFor(locale)+'"');
html=html.replace('<button class="locale-button"','<a href="'+pathFor(locale==='en'?'ar':'en',page)+'" class="locale-button"').replace('<span>'+ (locale==='en'?'العربية':'EN')+'</span></button>','<span>'+ (locale==='en'?'العربية':'EN')+'</span></a>');
const selected=services.find(s=>page==='services/'+s.id);
if(selected) html=html.replaceAll('href="'+pathFor(locale,'contact')+'"','href="'+pathFor(locale,'contact')+'?service='+selected.id+'#contact"');
if(page==='contact') html=html.replaceAll('href="'+pathFor(locale,'contact')+'"','href="#contact"');
html=html.replace('<a href="'+pathFor(locale,page)+'">','<a href="'+pathFor(locale,page)+'" aria-current="page">');
return applyUniqueImages(html,page,locale);
}
