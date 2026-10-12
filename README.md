# AMAFH Commercial Brokers

English and Arabic website for UAE banking, finance and insurance enquiries: 19 page designs, 38 canonical pages, full RTL, local fonts and campaign images. Built with Vite, TypeScript, GSAP and Lenis.

## Requirements and local review

Use Node.js 24 or later; the static generator uses native TypeScript stripping.

```sh
npm ci
npm run dev
```

- English: http://127.0.0.1:4318/en/
- Arabic: http://127.0.0.1:4318/ar/
- New detail sections: http://127.0.0.1:4318/en/about/#decision-explorer

The development server binds to loopback on strict port 4318. Development is always marked noindex.

## Build and checks

```sh
npm run build
npm run check
```

The build type-checks the source and produces complete static HTML, 38 canonical pages, localized error pages, fonts, images, robots.txt and sitemap.xml in dist/. The checker verifies page-specific metadata, internal links, bilingual parity, two added content sections and 90 distinct photographic assignments with valid responsive variants.

Default builds remain noindex for review. Build for an authorized production release with VITE_SITE_INDEXABLE=true so static HTML, runtime metadata and robots.txt agree.

PowerShell:

```powershell
$env:VITE_SITE_INDEXABLE = 'true'
npm run build
Remove-Item Env:VITE_SITE_INDEXABLE
npm run check
node scripts/prepare-cpanel-release.mjs
```

Linux/cPanel build environment:

```sh
VITE_SITE_INDEXABLE=true npm run build
npm run check
node scripts/prepare-cpanel-release.mjs
```

The release-preparation script adds the reviewed Apache template to dist/.htaccess and writes a local file/hash manifest. It does not upload, delete remote files or deploy. Before uploading the contents of dist/, confirm the document root for amafhdubai.ae and merge any existing host-specific .htaccess directives. The template uses native directory indexes, HTTPS/canonical root redirects and a true 404 document; it does not turn missing routes into successful homepage responses.

**Hosting is not connected or deployed by this repository import.** cPanel integration follows the GitHub push.

## Website behaviour

Home, About, Why AMAFH, Our Approach, How It Works, Banking & Insurance, Contact, Services, three categories and eight detailed service pages exist in both languages. All header/footer links and service CTAs have destinations. Language switching retains the corresponding route and in-memory enquiry fields.

The Home services showcase keeps its horizontal scroll pin, arrows, filters and mobile fallback. All pages share the sticky footer reveal and brand hover effects. Every page has two additional sections: a three-chapter expanding accordion and three detailed review cards. Desktop scrolling advances chapters; buttons and RTL-aware keyboard controls also work. Narrow or short screens use a vertical accordion. Cards layer only when their complete content fits below the header. Reduced motion disables scroll interpolation and pins for these sections.

The current website uses 90 distinct generated photographs across the 19 designs; matching translations share each photograph. Native-ratio frames, responsive WebP variants and original generated PNGs are retained. The official logo remains unchanged. See ASSETS.md for provenance.

## Content and enquiry boundaries

Owner-confirmed services, domain and business contacts are implemented. docs/RESEARCH.md records educational primary sources; these are not claims of AMAFH partnerships. No invented staff, approvals, statistics or promotional rates are presented. Each page has original additional content, with approximately 550 more English words and matching Arabic coverage in the latest expansion.

The contact form validates and prepares a draft locally. A visitor chooses copy, email or WhatsApp and sends from that application. There is no backend, storage or automatic submission. WhatsApp availability for the supplied business number has not been independently confirmed; no external test message was sent.

## Source and media records

- src/content.ts, routes.ts, seo.ts: business copy, routes, metadata and language handling.
- src/view.ts, inner-pages.ts, expanded-sections.ts: shared shell and page layouts.
- src/service-details.ts, service-expansion.ts, page-expansion.ts: guides and additional detail.
- src/decision-content.ts, decision-sections.ts, decision-motion.ts: the new bilingual accordion and review cards.
- src/main.ts, scroll.ts: interactions, smooth scrolling and animation lifecycle.
- src/*.css: current design system, responsive rules and full-image framing.
- assets/generated/: retained original PNGs, including historical compositions.
- assets/metadata/: portable prompts, source assignments, dimensions and pixel hashes. Generation records reference retained project files rather than private machine/session locations.
- public/: served assets, responsive photographs and official branding.
- scripts/: static generation, image preparation, page checks and release preparation.

Normal build/check commands use the versioned metadata and do not need local reports. Image regeneration can use node scripts/prepare-unique-images.mjs. The replacement/planning scripts are generation-maintenance tools; do not replay historical replacements against unrelated new assignment plans. scripts/import-image-metadata.mjs imports older local generation records when those records are available; it is not needed after cloning.

## Verification and repository exclusions

TypeScript/Vite and the 38-page static audit passed. Earlier image-fitting checks covered 152 bilingual viewport cases. The newly added accordion/cards have not completed browser interaction or responsive visual verification because the local browser-control runtime was unavailable; static checks do not claim to validate their final motion.

Vite reports an advisory for the main JavaScript chunk above 500 kB (approximately 175 kB gzip); the build succeeds. Production indexing setup does not imply live indexing or ranking results.

Local screenshots, reports, release packages, node_modules, dist, environment files and credentials are excluded from Git. Audit output is generated under the ignored artifacts/ directory and remains local. No hosting secrets are needed to build the website.
