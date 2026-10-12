# Asset provenance

## Generated hero

- Method: built-in imagegen tool, no external API key or CLI fallback.
- Original project file: `assets/source/hero.png` (1448 × 1086, 1,835,757 bytes).
- Delivered file: `public/images/hero.webp` (1440 × 1080, 62,442 bytes).
- The generated illustration is not represented as a real AMAFH employee or customer.
- WebP conversion uses Sharp at quality 86, with no compositional changes. Arabic mirrors the displayed illustration in CSS to preserve the stepped composition.

### Final generation prompt

Use case: photorealistic-natural. Asset type: premium financial services website hero photography, no website UI. Create a high-end editorial studio photograph, landscape 4:3 composition, of a friendly confident young adult Middle Eastern woman with naturally curly dark brown hair wearing a soft dusty blush pink blouse and cream trousers, standing holding a small unbranded matte black payment card near her right shoulder, subtle warm smile toward camera. Subject positioned on the right 60 percent of the frame, from waist upward, ample empty light warm grey studio background on left and upper left for a stepped web image mask. Soft natural diffused daylight, organic skin texture, understated modern Dubai financial services campaign, clean pale-grey and blush palette. Keep full top of head and elbows within frame, hands anatomically natural. No text, no letters, no logo, no watermark, no charts, no UI. This is illustrative marketing imagery, not a real AMAFH employee or customer. Save the output image.

## Supporting photographs

Saved locally from Unsplash image endpoints; no runtime third-party image calls.

| Local file | Source |
| --- | --- |
| `public/images/dubai.jpg` | https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1500&q=85 |
| `public/images/home.jpg` | https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85 |
| `public/images/car.jpg` | https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85 |
| `public/images/meeting.jpg` | https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85 |

These illustrate the service categories and are not represented as AMAFH premises, employees, partners, financed properties or vehicles.

## Other visuals

Original CSS card / abstract ring compositions and inline SVG interface icons. Fonts are bundled through Fontsource; package licence files are retained in their packages. All English H1 and H2 headings use Plus Jakarta Sans Variable at weight 800, with rounded geometric lettering inspired by the owner's supplied “Olive” typography reference. The hero uses two lines with a purple “chapter,” accent. English H3 headings use Inter Variable, English body copy uses Manrope Variable, and Arabic uses Noto Sans Arabic Variable.

The two owner-supplied Nova screenshots informed composition, spacing, typography and colour direction; they are not used as page backgrounds or flattened website content.

## Owner-supplied logo

- Source: the owner-supplied Black and White Minimal Typographic Business Logo.png, retained unchanged as the local asset below.
- Local asset: `public/images/amafh-logo.png` (2000 × 2000, transparent PNG, 205,483 bytes).
- SHA-256 of both source and copied file: `52E05D0A7E072DDCF721DB8B3C64781EB6CA182F2D9EA734669FB14A547D6380`.
- The original image is unchanged. Header, footer and About branding display its visible artwork through an SVG viewport at x=307, y=679, width=1383, height=371, excluding only transparent canvas padding. Aspect ratio and supplied colours are preserved in English and Arabic.
- `scripts/sync-logo.mjs` embeds the original PNG into a self-contained favicon SVG whose viewport displays the supplied symbol. No logo lettering or artwork is recreated.


## Current campaign image refresh — 12 October 2026

All displayed photography now uses a new AMAFH campaign created with the built-in image_gen tool. The previous generated hero and Unsplash supporting photographs above are retired from page rendering; they remain historical source records. The official owner-supplied logo and SVG interface icons retain their original identity.

Twelve original assets: hero, Dubai architecture, consultation, personal approach, credit cards, personal finance, car loans, mortgages, car insurance, life insurance, current accounts and savings accounts. Art direction: cream stone and plaster, charcoal, muted mauve and pink/purple accents, natural light, editorial lifestyle and product photography. Imagery is illustrative, not a claim about actual employees, customers, premises, vehicles, listings or issued AMAFH financial products.

Original PNGs: assets/generated/<id>.png.
Website WebP images: public/images/generated/<id>.webp.
Responsive variants: <id>-640.webp and <id>-960.webp.
The 12 full-size WebPs total about 1.70 MiB. Portraits are 1122x1402; landscape assets are 1440x1080. Format conversion and resizing use Sharp; no image content was changed outside image_gen.

Exact prompts, generation locations and output mapping are in assets/metadata/image-prompts.json. Actual dimensions/file sizes are in assets/metadata/campaign-images.json. The built-in tool does not expose a selectable model identifier, so no particular GPT image model version is claimed. No fallback CLI/API was used.

Every current <img> in the 38 canonical static pages references /images/generated/, with local responsive sources, intrinsic dimensions, alt text, lazy loading for supporting images and priority loading for hero images. The verification script checks that every referenced size exists.

## Unique photographs across pages — 12 October 2026

The campaign above has been expanded with 78 independently generated original images. There are now 90 unique photograph placements across 19 page designs. Matching English/Arabic pages share the same placement, as confirmed by the owner. No photograph is repeated within or between distinct page designs; official branding and vector UI symbols keep their identity.

New original PNGs: `assets/generated/unique/<page-slot>.png`. Website WebPs and 640/960 responsive variants: `public/images/generated/<page-slot>*.webp`. The earlier 12 originals remain at their first Home placement. Total campaign output: 270 WebPs, 13.40 MiB for full-size assets.

Exact new prompts: `assets/metadata/unique-image-prompts.json`. Generation locations: `assets/metadata/unique-image-sources.json`. Fixed page/slot plan: `assets/metadata/unique-image-plan.json`. Actual dimensions, file sizes and decoded original pixel hashes: `assets/metadata/unique-campaign-images.json`. These are original illustrative campaign visuals created using the built-in image generation tool; its model selector is not exposed. No fallback CLI/API was used.

`src/unique-image-registry.ts` records each page's image assignment and focal point. `src/unique-images.ts` applies it to both languages and rejects changed slot counts/subjects. `node scripts/prepare-unique-images.mjs` prepares responsive formats and rebuilds the registry from retained originals. `npm run check` verifies actual rendered source assignments, translation parity and distinct decoded output pixels. Visual and browser evidence: `artifacts/unique-images-verification.md`.

## Panoramic feature-card replacements — 12 October 2026

Six About/Why AMAFH card photographs were independently recreated with the built-in image_gen tool as native 2:1 panoramas. Their IDs end in `-wide-v2`; originals are in `assets/generated/unique/`, and website outputs/variants are in `public/images/generated/`. Full WebPs are 1440x720; responsive copies are 960x480 and 640x320. Matching English/Arabic pages share each assignment. Previous source files remain historical; 90 distinct active photographs still supply the current pages.

The six frames now follow the exact image aspect ratio at every breakpoint and display the full scene without stretching or cover cropping. Prompts: `assets/metadata/wide-card-image-prompts.json`. Saved paths, generation mode, responsive checks and screenshots: `artifacts/wide-card-images-verification.md`.

## Full-site framing correction — 12 October 2026

Eighteen additional scenes were recreated using the built-in image_gen tool for their intended native frames: a 3:1 Home values banner, nine 2:1 landscape/service scenes, and eight 4:5 hero/editorial portraits. New IDs end in `-fit-v3`. Originals are retained at `assets/generated/unique/<id>.png`; full and 640/960 WebP variants are at `public/images/generated/`. Exact prompts and generation paths are in `assets/metadata/all-photo-fit-prompts.json` and `assets/metadata/all-photo-fit-sources.json`. No model selector is exposed by the tool, and no fallback API/CLI was used.

The active page set still uses 90 distinct photographs, shared only by corresponding English/Arabic pages. The fixed plan now uses 88 originals from `assets/generated/unique/` and two retained originals from `assets/generated/`. Historical counts above describe earlier refreshes, not the current assignment plan. Retired original/output files remain retained.

Every photographic frame now uses its native source proportions and `object-fit:contain`, with correct intrinsic dimensions and responsive sources. Portrait frames are sized within the existing columns. The stepped Home hero mask remains; Arabic mirrors its shape and photo independently of the entry animation. Parallax is restricted to 6px within a reserved 10px border, and photo hover uses brightness rather than enlarging the source beyond its frame. The pinned services crawl and footer reveal remain in place.

Final build and static page verification passed. Browser geometry checks covered 38 canonical pages at four widths (152 cases): 714 laid-out photos plus six intentionally hidden responsive sidebar instances, with no proportion, boundary or document-overflow failures. Generation provenance, validation limits and final screenshots are recorded in `artifacts/all-photo-fit-verification.md` and its JSON companion.

## Repository provenance

Versioned image records are under `assets/metadata/`; all source/reference paths point to retained project files. Original local generation locations, screenshots and audit reports remain in the ignored `artifacts/` directory. Historical report links above refer to those local records. Normal cloning, building, page verification and image preparation do not require private machine/session paths.

