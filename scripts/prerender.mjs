import fs from 'node:fs/promises';
import path from 'node:path';
import {renderSite} from '../src/view.ts';
import {pages,origin,pathFor} from '../src/routes.ts';
import {renderDocument} from '../src/seo.ts';
const template=await fs.readFile('dist/index.html','utf8');
const indexable=process.env.VITE_SITE_INDEXABLE==='true';
for(const locale of ['en','ar']) {
  for(const page of [...pages,'404']) {
    const folder=path.join('dist',locale,page);
    await fs.mkdir(folder,{recursive:true});
    await fs.writeFile(path.join(folder,'index.html'),renderDocument(template,renderSite(locale,page),locale,page,indexable));
  }
}
await fs.writeFile('dist/index.html',renderDocument(template,renderSite('en',''),'en','',indexable));
await fs.writeFile('dist/404.html',renderDocument(template,renderSite('en','404'),'en','404',false));
const sitemap=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${['en','ar'].flatMap(locale=>pages.map(page=>`<url><loc>${origin+pathFor(locale,page)}</loc>${['en','ar'].map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${origin+pathFor(l,page)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin+pathFor('en',page)}"/></url>`)).join('')}</urlset>`;
await fs.writeFile('dist/sitemap.xml',sitemap);
await fs.writeFile('dist/robots.txt',`User-agent: *\n${indexable?'Allow: /':'Disallow: /'}\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prerendered ${pages.length*2} bilingual pages, localized 404s and sitemap. Indexing: ${indexable?'enabled':'preview noindex'}.`);
