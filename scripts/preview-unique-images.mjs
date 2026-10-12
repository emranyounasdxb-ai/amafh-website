import fs from 'node:fs/promises';
import sharp from 'sharp';
const sources=JSON.parse(await fs.readFile('assets/metadata/unique-image-sources.json','utf8'));
const start=Number(process.argv[2]??0),end=Number(process.argv[3]??sources.assets.length);
await fs.mkdir('artifacts/image-review',{recursive:true});
for(let offset=start;offset<Math.min(end,sources.assets.length);offset+=6) {
 const group=sources.assets.slice(offset,Math.min(offset+6,end));
 const layers=[];
 for(let i=0;i<group.length;i++) {
  const asset=group[i];
  const preview=await sharp(asset.source).resize({width:480,height:360,fit:'contain',background:'#f1f0ec'}).png().toBuffer();
  layers.push({input:preview,left:(i%2)*480,top:Math.floor(i/2)*394});
  const label=Buffer.from(`<svg width="480" height="34"><rect width="480" height="34" fill="#f1f0ec"/><text x="12" y="24" font-family="Arial" font-size="17" fill="#232323">${asset.id}</text></svg>`);
  layers.push({input:label,left:(i%2)*480,top:Math.floor(i/2)*394+360});
 }
 const output=`artifacts/image-review/${String(offset+1).padStart(2,'0')}-${String(offset+group.length).padStart(2,'0')}.jpg`;
 await sharp({create:{width:960,height:Math.ceil(group.length/2)*394,channels:3,background:'#f1f0ec'}}).composite(layers).jpeg({quality:90}).toFile(output);
 console.log(output);
}
