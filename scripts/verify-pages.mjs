import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pages,origin,pathFor} from '../src/routes.ts';
import {services} from '../src/content.ts';
import {serviceDetails} from '../src/service-details.ts';
import {decisionContent} from '../src/decision-content.ts';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const photoPlan=JSON.parse(await fs.readFile('assets/metadata/unique-image-plan.json','utf8'));
const photoManifest=JSON.parse(await fs.readFile('assets/metadata/unique-campaign-images.json','utf8'));
assert(photoManifest.complete,'Unique campaign preparation is incomplete');
const photographIds=[];
const photographsByPage=new Map();
const all=new Map();
const results=[];
for(const locale of ['en','ar']) for(const page of pages) all.set(pathFor(locale,page),await fs.readFile(`dist${pathFor(locale,page)}index.html`,'utf8'));
const titles=new Set(), descriptions=new Set();
for(const [url,html] of all) {
  const locale=url.split('/')[1], page=url.split('/').slice(2,-1).join('/');
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description=html.match(/name="description" content="([^"]+)"/)?.[1];
  assert(title&&!titles.has(title),`Duplicate/missing title ${url}`); titles.add(title);
  assert(description&&!descriptions.has(description),`Duplicate/missing description ${url}`); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`H1 count ${url}`);
  assert(html.includes(`<html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}">`),`Language direction ${url}`);
  assert(html.includes(`rel="canonical" href="${origin+url}"`),`Canonical ${url}`);
  for(const l of ['en','ar']) assert(html.includes(`hreflang="${l}" href="${origin+pathFor(l,page)}"`),`Alternate ${url}`);
  assert(!/lorem ipsum|Design preview · Partner directory pending|undefined/.test(html),`Placeholder ${url}`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`Duplicate IDs ${url}`);
  for(const img of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\balt="[^"]*"/.test(img[0]),`Missing alt ${url}`);
    const src=img[0].match(/\bsrc="([^"]+)"/)?.[1];
    assert(src?.startsWith('/images/generated/'),`Non-campaign photograph ${url}: ${src}`);
    await fs.access(`dist${src}`);
    const srcset=img[0].match(/\bsrcset="([^"]+)"/)?.[1];
    assert(srcset,`Missing responsive image variants ${url}`);
    for(const variant of srcset.split(',')) await fs.access(`dist${variant.trim().split(' ')[0]}`);
  }
  for(const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    if(!m[1].startsWith('/')&&!m[1].startsWith('#')) continue;
    const target=new URL(m[1],`https://amafhdubai.ae${url}`);
    assert(all.has(target.pathname),`Broken internal page ${url} -> ${m[1]}`);
    if(target.hash) assert(all.get(target.pathname).includes(`id="${target.hash.slice(1)}"`),`Broken anchor ${url} -> ${m[1]}`);
  }
  const json=html.match(/type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  assert(json&&JSON.parse(json)['@graph'].length>=3,`Schema ${url}`);
  const main=html.match(/<main\b[^>]*>(.*?)<\/main>/s)?.[1]??'';
  if(page==='workplace-policy') {
    assert(main.includes(locale==='en'?'we do not offer hybrid or remote working arrangements':'ولا توفر الشركة ترتيبات للعمل الهجين أو العمل عن بُعد'),`On-site arrangement ${url}`);
    assert(main.includes('info@amafhdubai.ae')&&main.includes('tel:+97142105555'),`Policy contact ${url}`);
    assert(main.includes('206')&&main.includes('218'),`Policy office ${url}`);
    assert(!/id="decision-(explorer|desk)"/.test(main),`Unrelated content on policy ${url}`);
    results.push({url,title,h1:1,headings:(main.match(/<h[123]\b/g)||[]).length,faqs:0});
    continue;
  }
  assert.equal((main.match(/id="decision-explorer"/g)||[]).length,1,`Missing/new accordion section count ${url}`);
  assert.equal((main.match(/id="decision-desk"/g)||[]).length,1,`Missing/new detail section count ${url}`);
  const newContent=decisionContent[page];
  assert(newContent,`Missing page-specific detail copy ${url}`);
  const newEnglishWords=[...newContent.panels.map(p=>p.text[0]),...newContent.cards.map(c=>c.text[0])].join(' ').split(/\s+/).length;
  assert(newEnglishWords>=290,`Insufficient substantive additional copy ${url}: ${newEnglishWords}`);
  assert.equal((main.match(/data-decision-index="\d"/g)||[]).length,3,`Accordion chapters ${url}`);
  for(const panel of newContent.panels) assert(main.includes(panel.text[locale==='en'?0:1]),`Missing translated accordion copy ${url}`);
  for(const card of newContent.cards) assert(main.includes(card.text[locale==='en'?0:1]),`Missing translated detail copy ${url}`);
  const photographs=[...main.matchAll(/<img\b[^>]*>/g)].map(image=>{
   const tag=image[0],id=tag.match(/\bdata-photo-id="([^"]+)"/)?.[1];
   assert(tag.includes(`src="/images/generated/${id}.webp"`),`Actual image source differs from assignment ${url}: ${id}`);
   assert(tag.includes(`/images/generated/${id}-640.webp 640w`)&&tag.includes(`/images/generated/${id}-960.webp 960w`),`Responsive sources differ from assignment ${url}: ${id}`);
   const asset=photoManifest.assets.find(item=>item.id===id);
   assert(asset&&tag.includes('data-photo-fit="full"')&&tag.includes(`aspect-ratio:${asset.width} / ${asset.height}`),`Full native photo frame ${url}: ${id}`);
   if(asset?.layout==='wide-card') {
    assert(Math.abs(asset.width/asset.height-2)<.01,`Panoramic source ratio ${url}: ${id}`);
    assert(tag.includes('data-photo-layout="wide-card"')&&tag.includes(`aspect-ratio:${asset.width} / ${asset.height}`),`Matching panoramic frame ${url}: ${id}`);
   }
   return id;
  });
  const expected=photoPlan.pages.find(item=>item.page===page)?.images.map(image=>image.id);
  assert.deepEqual(photographs,expected,`Incorrect unique photograph assignments ${url}`);
  assert(html.includes(`property="og:image" content="${origin}/images/generated/${expected[0]}.webp"`),`Page-specific social photograph ${url}`);
  assert.equal(new Set(photographs).size,photographs.length,`Repeated photograph within ${url}`);
  photographsByPage.set(url,photographs);
  if(locale==='en')photographIds.push(...photographs);
  results.push({url,title,h1:1,headings:(main.match(/<h[123]\b/g)||[]).length,faqs:(main.match(/<details\b/g)||[]).length,words:main.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length});
}
for(const page of pages) {
  const en=results.find(r=>r.url===pathFor('en',page));const ar=results.find(r=>r.url===pathFor('ar',page));
  assert.equal(en.headings,ar.headings,`Heading parity ${page}`);assert.equal(en.faqs,ar.faqs,`FAQ parity ${page}`);
  assert.deepEqual(photographsByPage.get(pathFor('en',page)),photographsByPage.get(pathFor('ar',page)),`Photo translation parity ${page}`);
}
assert.equal(photographIds.length,90,'Expected 90 photograph placements per language');
assert.equal(new Set(photographIds).size,90,'Photograph reused across distinct page designs');
const pixelHashes=new Set();
for(const id of photographIds) {
 const asset=photoManifest.assets.find(item=>item.id===id);
 assert(asset,`Missing source record ${id}`);
 const raw=await sharp(asset.output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const hash=createHash('sha256').update(JSON.stringify(raw.info)).update(raw.data).digest('hex');
 assert(!pixelHashes.has(hash),`Duplicate decoded photograph pixels: ${id}`);pixelHashes.add(hash);
 assert.equal(raw.info.width,asset.width,`Intrinsic width ${id}`);assert.equal(raw.info.height,asset.height,`Intrinsic height ${id}`);
}
for(const service of services) {
  const detail=serviceDetails[service.id];
  assert.equal(detail.faqs.length,4);
  for(const locale of ['en','ar']) {
    const html=all.get(pathFor(locale,`services/${service.id}`));
    assert(html.includes(`?service=${service.id}#contact`),`Service context ${service.id}`);
    assert(html.includes('id="service-guide-title"'),`Missing practical guide ${service.id}`);
    assert.equal((html.match(/<details\b/g)||[]).length,6,`Expanded FAQ count ${service.id}`);
  }
}
const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length*2);
const report={checkedAt:new Date().toISOString(),pages:results.length,checks:['unique titles and descriptions','single H1','language and RTL','canonical and reciprocal hreflang','all internal destinations and fragments','unique IDs','image alt attributes','all photographs use generated assets','all responsive asset paths exist','structured data','EN/AR heading and FAQ parity','service practical guides and 6 FAQs','service enquiry context',`${pages.length*2} sitemap entries`],results};
report.photographs={uniquePerLocale:90,additionalGenerated:photoPlan.newImagesRequired,decodedPixelHashes:pixelHashes.size,fullFitPlacementsPerLocale:90,translationPolicy:'Matching EN/AR pages share the same assignment'};
report.checks.push('90 unique photo placements across 19 page designs','no duplicate decoded photograph pixels','matching EN/AR photograph assignments');
report.checks.push('two added sections per page','19 page-specific bilingual content sets','three accessible accordion chapters per page','substantive additional copy in both sections');
await fs.mkdir('artifacts',{recursive:true});await fs.writeFile('artifacts/pages-verification.json',JSON.stringify(report,null,2));
console.log(`PASS: ${results.length} static HTML pages. All internal links, metadata, language parity and enquiry destinations validated.`);
