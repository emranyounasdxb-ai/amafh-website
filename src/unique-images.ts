import type {Locale} from './content.ts';
import {uniquePhotoAssignments,type PhotoAssignment} from './unique-image-registry.ts';

const byId=new Map(Object.values(uniquePhotoAssignments).flat().map(asset=>[asset.id,asset]));
function photoTag(tag:string,asset:PhotoAssignment,locale:Locale,slot:number) {
 const subject=tag.match(/\bsrc="\/images\/generated\/([^"/]+)\.webp"/)?.[1];
 if(subject!==asset.subject)throw new Error(`Photograph subject changed at slot ${slot}: ${subject}`);
 const src=`/images/generated/${asset.id}.webp`;
 const srcset=`/images/generated/${asset.id}-640.webp 640w, /images/generated/${asset.id}-960.webp 960w, ${src} ${asset.width}w`;
 let result=tag.replace(/\bsrc="[^"]*"/,`src="${src}"`).replace(/\bsrcset="[^"]*"/,`srcset="${srcset}"`).replace(/\bwidth="[^"]*"/,`width="${asset.width}"`).replace(/\bheight="[^"]*"/,`height="${asset.height}"`);
 if(!/\balt=""/.test(tag))result=result.replace(/\balt="[^"]*"/,`alt="${asset.alt[locale==='en'?0:1]}"`);
 return result.replace('<img ',`<img data-photo-id="${asset.id}" data-photo-slot="${slot}" data-photo-fit="full" ${asset.layout?`data-photo-layout="${asset.layout}" `:''}style="aspect-ratio:${asset.width} / ${asset.height}" `);
}
function photoFrames(html:string) {
 // These templates put frame photography immediately after its opening tag.
 // Feature cards use the photograph's intrinsic ratio directly, without a wrapper.
 return html.replace(/(<(?:div|aside)\b[^>]*>)(\s*)(<img\b[^>]*\bdata-photo-id="([^"]+)"[^>]*>)/g,(_match,frame:string,space:string,img:string,id:string)=>{
  const asset=byId.get(id);
  if(!asset)return frame+space+img;
  const style=`--photo-ratio:${asset.width} / ${asset.height};--photo-aspect:${asset.width/asset.height}`;
  return frame.replace(/>$/,` data-photo-frame="full" style="${style}">`)+space+img;
 });
}

// Filtering rebuilds Home cards outside the full-page renderer.
export function applyHomeServiceImages(html:string,locale:Locale) {
 const cards=uniquePhotoAssignments[''].slice(2,10);
 return photoFrames(html.replace(/<img\b[^>]*>/g,tag=>{
  const subject=tag.match(/\bsrc="\/images\/generated\/([^"/]+)\.webp"/)?.[1];
  const index=cards.findIndex(asset=>asset.subject===subject);
  if(index<0)throw new Error(`Unassigned Home service photograph: ${subject}`);
  return photoTag(tag,cards[index],locale,index+3);
 }));
}

// Each placement belongs to one page design; its translation uses the same photo.
// Matching the original subject also catches template changes that shift a slot.
export function applyUniqueImages(html:string,page:string,locale:Locale) {
 const assignments=uniquePhotoAssignments[page];
 if(!assignments)return html;
 return html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/,(_match,open:string,main:string,close:string)=>{
  let index=0;
  const content=main.replace(/<img\b[^>]*>/g,tag=>{
   const asset=assignments[index++];
   if(!asset)throw new Error(`Unassigned photograph on ${page||'home'}, slot ${index}`);
   return photoTag(tag,asset,locale,index);
  });
  if(index!==assignments.length)throw new Error(`Photograph placement count changed on ${page||'home'}: ${index} instead of ${assignments.length}`);
  return open+photoFrames(content)+close;
 });
}
