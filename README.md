# AMAFH Commercial Brokers

A bilingual corporate website for AMAFH Commercial Brokers, a Dubai-based commercial broker and service provider for banking, finance and insurance enquiries in the UAE.

**Domain:** [amafhdubai.ae](https://amafhdubai.ae)

## Services

- Credit cards
- Personal finance and personal loans
- Car loans
- Mortgage loans
- Car insurance
- Life insurance
- Current accounts
- Savings accounts

## Languages

The website includes 20 pages in English and 20 matching pages in Arabic, with full right-to-left navigation and layouts.

## Website features

- Responsive layouts for desktop, tablet and mobile.
- Animated service showcases and expanding content panels.
- Smooth scrolling and a revealing footer.
- Consistent AMAFH branding, typography and campaign imagery.
- Dedicated company, service and contact pages.
- Page-specific content, metadata, canonical URLs and language alternates.
- Enquiry drafts that visitors can send through email or WhatsApp.
- Keyboard navigation and reduced-motion support.

## Technology

TypeScript, Vite, GSAP and Lenis.

## Hosting and deployment

This is a static website with no PHP application dependencies. cPanel currently
declares the `ea-php85` handler in its generated `.htaccess` block. The FTPS
deployment accepts the exact reviewed configuration and preserves the PHP block
in place. Any unreviewed hosting change still stops deployment.

Run `node --test scripts/hosting-config.test.mjs` to verify configuration
preservation and rejection of unexpected changes. The reviewed configuration is
recorded in `docs/deployment/reviewed-cpanel-php85.htaccess`; it is evidence for
tests, not a replacement hosting configuration to upload manually.
