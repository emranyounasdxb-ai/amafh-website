import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const replacements=JSON.parse(await fs.readFile('assets/metadata/all-photo-fit-sources.json','utf8')).assets;
const plan=JSON.parse(await fs.readFile('assets/metadata/unique-image-plan.json','utf8'));
const sources=JSON.parse(await fs.readFile('assets/metadata/unique-image-sources.json','utf8'));
assert.equal(replacements.length,18,'Expected all 18 new compositions');
for(const asset of replacements) {
 const placement=plan.pages.find(page=>page.page===asset.page)?.images.find(image=>image.slot===asset.slot);
 assert(placement&&[asset.previousId,asset.id].includes(placement.id),`Unexpected replacement slot ${asset.id}`);
 assert.equal(placement.subject,asset.subject);
 Object.assign(placement,{id:asset.id,portrait:asset.portrait,layout:asset.layout,existing:false});
 const existing=sources.assets.find(image=>image.id===asset.id);
 if(existing)assert.equal(existing.source,asset.source);
 else sources.assets.push({id:asset.id,previousId:asset.previousId,subject:asset.subject,page:asset.page,slot:asset.slot,portrait:asset.portrait,layout:asset.layout,source:asset.source});
}
plan.newImagesRequired=plan.pages.flatMap(page=>page.images).filter(image=>!image.existing).length;
await fs.writeFile('assets/metadata/unique-image-plan.json',JSON.stringify(plan,null,2));
await fs.writeFile('assets/metadata/unique-image-sources.json',JSON.stringify(sources,null,2));
console.log('Assigned all 18 replacement compositions; historical source files remain retained.');
