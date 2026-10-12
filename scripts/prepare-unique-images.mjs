import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createHash} from 'node:crypto';

const plan=JSON.parse(await fs.readFile('assets/metadata/unique-image-plan.json','utf8'));
const sources=JSON.parse(await fs.readFile('assets/metadata/unique-image-sources.json','utf8'));
const byId=new Map(sources.assets.map(asset=>[asset.id,asset]));
assert.equal(byId.size,sources.assets.length,'Duplicate generation records');
const planned=plan.pages.flatMap(page=>page.images);
const missing=planned.filter(asset=>!asset.existing&&!byId.has(asset.id));
const partial=process.argv.includes('--partial');
assert(partial||missing.length===0,`Still missing ${missing.length} original images: ${missing.map(a=>a.id).join(', ')}`);
await fs.mkdir('assets/generated/unique',{recursive:true});
await fs.mkdir('public/images/generated',{recursive:true});

const prepared=[];
let cursor=0;
const queue=planned.filter(asset=>asset.existing||byId.has(asset.id));
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<queue.length) {
  const asset=queue[cursor++];
  const workspaceSource=asset.existing?`assets/generated/${asset.id}.png`:`assets/generated/unique/${asset.id}.png`;
  if(!asset.existing) {
   let original;
   try {original=await fs.readFile(byId.get(asset.id).source);}
   catch(error) {if(error.code!=='ENOENT')throw error;original=await fs.readFile(workspaceSource);}
   try {assert((await fs.readFile(workspaceSource)).equals(original),`Existing source differs: ${asset.id}`);}
   catch(error) {if(error.code!=='ENOENT')throw error;await fs.writeFile(workspaceSource,original);}
   for(const width of [640,960,1440]) {
    const output=`public/images/generated/${asset.id}${width===1440?'':`-${width}`}.webp`;
    try {await fs.access(output);}
    catch {await sharp(workspaceSource).resize({width,withoutEnlargement:true}).webp({quality:84,effort:4}).toFile(output);}
   }
  }
  const output=`public/images/generated/${asset.id}.webp`;
  const meta=await sharp(output).metadata();
  if(asset.layout==='wide-card')assert(Math.abs(meta.width/meta.height-2)<.01,`Wide-card photograph must be 2:1: ${asset.id}`);
  if(asset.layout==='panorama')assert(Math.abs(meta.width/meta.height-3)<.01,`Banner photograph must be 3:1: ${asset.id}`);
  if(asset.layout==='portrait')assert(Math.abs(meta.width/meta.height-.8)<.01,`Portrait photograph must be 4:5: ${asset.id}`);
  const raw=await sharp(workspaceSource).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const pixelSha256=createHash('sha256').update(JSON.stringify(raw.info)).update(raw.data).digest('hex');
  prepared.push({id:asset.id,subject:asset.subject,layout:asset.layout,workspaceSource,output,width:meta.width,height:meta.height,bytes:(await fs.stat(output)).size,pixelSha256});
 }
}));
prepared.sort((a,b)=>planned.findIndex(asset=>asset.id===a.id)-planned.findIndex(asset=>asset.id===b.id));
assert.equal(new Set(prepared.map(asset=>asset.pixelSha256)).size,prepared.length,'Duplicate original pixels detected');
await fs.writeFile('assets/metadata/unique-campaign-images.json',JSON.stringify({generatedAt:new Date().toISOString(),complete:missing.length===0,assets:prepared},null,2));
if(partial&&missing.length) {console.log(`Prepared ${prepared.length} unique originals; ${missing.length} generation jobs remain.`);process.exit(0);}

const descriptions={
 hero:['Illustrative campaign portrait of a woman holding an unbranded payment card','صورة حملة توضيحية لسيدة تحمل بطاقة دفع بدون علامة تجارية'],
 dubai:['Illustrative Dubai-inspired city scene','مشهد توضيحي مستوحى من مدينة دبي'],
 meeting:['Illustrative conversation about financial plans','حوار توضيحي حول الخطط المالية'],
 approach:['Illustrative personal consultation in a modern meeting space','جلسة استشارية توضيحية في مساحة اجتماعات حديثة'],
 'credit-cards':['Original illustrative scene with an unbranded payment card','مشهد توضيحي أصلي لبطاقة دفع بدون علامة تجارية'],
 'personal-finance':['Original illustrative scene about personal and household financial planning','مشهد توضيحي أصلي حول التخطيط المالي الشخصي والأسري'],
 'car-loans':['Original illustrative scene about planning a vehicle purchase','مشهد توضيحي أصلي حول التخطيط لشراء مركبة'],
 mortgages:['Original illustrative scene about finding and planning a home','مشهد توضيحي أصلي حول اختيار المنزل والتخطيط له'],
 'car-insurance':['Original illustrative scene about vehicle ownership and protection','مشهد توضيحي أصلي حول امتلاك المركبة وحمايتها'],
 'life-insurance':['Original illustrative scene about family life and future protection','مشهد توضيحي أصلي حول الحياة الأسرية والحماية المستقبلية'],
 'current-accounts':['Original illustrative scene about everyday banking and account access','مشهد توضيحي أصلي حول الخدمات المصرفية اليومية والوصول إلى الحساب'],
 'savings-accounts':['Original illustrative scene about building savings for future goals','مشهد توضيحي أصلي حول بناء المدخرات للأهداف المستقبلية'],
};
const registry=Object.fromEntries(plan.pages.map(page=>[page.page,page.images.map(asset=>{
 const meta=prepared.find(item=>item.id===asset.id);
 return {id:asset.id,subject:asset.subject,width:meta.width,height:meta.height,alt:descriptions[asset.subject],...(asset.layout?{layout:asset.layout}:{}),...((!asset.existing&&asset.portrait)||asset.id==='about-03'?{objectPosition:'50% 20%'}:{})};
})]));
await fs.writeFile('src/unique-image-registry.ts',`// Generated from the fixed placement plan. Rebuild with scripts/prepare-unique-images.mjs.\nexport type PhotoAssignment = {id:string;subject:string;width:number;height:number;alt:readonly [string,string];objectPosition?:string;layout?:'wide-card'|'portrait'|'panorama'};\nexport const uniquePhotoAssignments:Record<string,PhotoAssignment[]> = ${JSON.stringify(registry,null,2)};\n`);
console.log(`Prepared ${prepared.length} distinct photographs and their responsive variants for ${plan.pages.length} bilingual page designs.`);
