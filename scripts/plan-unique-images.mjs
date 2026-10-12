import fs from 'node:fs/promises';
import {renderSite} from '../src/view.ts';
import {pages} from '../src/routes.ts';
const all=[],used=new Set();
for(const page of pages){
 const html=renderSite('en',page),main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
 if(main.includes('data-photo-id='))throw new Error('This fixed image plan is already applied. Do not overwrite its source subjects with assigned asset IDs.');
 const images=[...main.matchAll(/<img\b[^>]*>/g)].map((m,i)=>{
  const subject=m[0].match(/src="\/images\/generated\/([^"]+)\.webp"/)[1];
  const keep=!used.has(subject);used.add(subject);
  return {slot:i+1,subject,decorative:m[0].includes('alt=""'),hero:m[0].includes('fetchpriority="high"'),portrait:['approach','dubai'].includes(subject),id:keep?subject:`${page.replaceAll('/','-')||'home'}-${String(i+1).padStart(2,'0')}`,existing:keep};
 });
 all.push({page,images});
}
const total=all.reduce((n,p)=>n+p.images.length,0),fresh=all.flatMap(p=>p.images).filter(i=>!i.existing).length;
await fs.writeFile('assets/metadata/unique-image-plan.json',JSON.stringify({createdAt:'2026-10-12',scope:'Every photograph placement is unique across the 19 page designs. Matching EN/AR translations share the same assignment. Official logo and vector UI symbols remain branding.',pages:all,totalPerLocale:total,newImagesRequired:fresh},null,2));
console.log(JSON.stringify({totalPhotographPlacements:total,newImagesRequired:fresh,pages:all.map(p=>({page:p.page||'home',placements:p.images.length}))}));
