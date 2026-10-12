import fs from 'node:fs/promises';
import sharp from 'sharp';
const manifest=JSON.parse(await fs.readFile('assets/metadata/image-prompts.json','utf8'));
await fs.mkdir('assets/generated',{recursive:true});
await fs.mkdir('public/images/generated',{recursive:true});
const data=[];
for(const item of manifest.assets) {
  try { await fs.access(item.workspaceSource); }
  catch { await fs.copyFile(item.source,item.workspaceSource); }
  const original=await sharp(item.workspaceSource).metadata();
  for(const width of [640,960,1440]) {
    const file=`public/images/generated/${item.id}${width===1440?'':`-${width}`}.webp`;
    await sharp(item.workspaceSource).resize({width,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(file);
  }
  const final=await sharp(item.output).metadata();
  data.push({id:item.id,width:final.width,height:final.height,sourceWidth:original.width,sourceHeight:original.height,bytes:(await fs.stat(item.output)).size});
}
await fs.writeFile('assets/metadata/campaign-images.json',JSON.stringify(data,null,2));
console.log(`Prepared ${data.length} campaign images and 24 responsive variants; ${(data.reduce((n,a)=>n+a.bytes,0)/1024/1024).toFixed(2)} MiB of full-size WebP assets.`);
