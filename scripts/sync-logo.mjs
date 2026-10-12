import { readFile, writeFile } from 'node:fs/promises';

// Embed the original PNG in a cropped SVG viewport; never redraw the artwork.
// Embedding keeps the favicon self-contained because SVG image contexts cannot
// load a separate image URL. The main site references the unchanged PNG directly.
const logo = await readFile(new URL('../public/images/amafh-logo.png', import.meta.url));
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 384"><svg x="31" y="6" width="322" height="372" viewBox="307 679 322 372"><image href="data:image/png;base64,${logo.toString('base64')}" width="2000" height="2000"/></svg></svg>\n`;
await writeFile(new URL('../public/favicon.svg', import.meta.url), favicon);
console.log('Favicon updated from the supplied AMAFH logo.');
