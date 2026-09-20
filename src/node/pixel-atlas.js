'use strict';
const { encodeRgbaPng } = require('./pixel-image');
function packMapPictures(pictures, { paged = false } = {}) {
  if (paged) return packMapPages(pictures);
  const width = 2048;
  let x = 1, y = 1, rowHeight = 0;
  const entries = pictures.map(picture => {
    if (!picture) return null;
    if (picture.width + 2 > width || picture.height > 4096) throw new Error('Invalid map sprite dimensions.');
    if (x + picture.width + 1 > width) { x = 1; y += rowHeight + 2; rowHeight = 0; }
    const entry = { x, y, width: picture.width, height: picture.height, dx: picture.dx, dy: picture.dy };
    x += picture.width + 2;
    rowHeight = Math.max(rowHeight, picture.height);
    return entry;
  });
  const height = y + rowHeight + 1;
  if (width * height > 32 * 1024 * 1024) throw new Error('Map sprite atlas exceeds its size limit.');
  const rgba = Buffer.alloc(width * height * 4);
  pictures.forEach((picture, index) => {
    if (!picture) return;
    const entry = entries[index];
    for (let row = 0; row < picture.height; row++) {
      const from = row * picture.width * 4;
      picture.rgba.copy(rgba, ((entry.y + row) * width + entry.x) * 4, from, from + picture.width * 4);
    }
  });
  return { entries, dataUrl: `data:image/png;base64,${encodeRgbaPng(width, height, rgba).toString('base64')}` };
}

// Preserve picture indices while placing tall sprites together. Pages avoid
// oversized GPU textures and are encoded one at a time, without a giant RGBA buffer.
function packMapPages(pictures) {
  const width = 2048, height = 4096, maxPages = 8;
  const entries = Array(pictures.length).fill(null), layouts = [];
  let page = null;
  const ordered = pictures.map((picture,index)=>({picture,index})).filter(v=>v.picture)
    .sort((a,b)=>b.picture.height-a.picture.height || b.picture.width-a.picture.width || a.index-b.index);
  for (const {picture,index} of ordered) {
    if (!Number.isInteger(picture.width) || !Number.isInteger(picture.height)
      || picture.width <= 0 || picture.height <= 0 || picture.width+2>width || picture.height+2>height)
      throw new Error('Invalid map sprite dimensions.');
    if (!page) {
      if (layouts.length >= maxPages) throw new Error('Map sprites exceed the atlas page budget.');
      page = {x:1,y:1,rowHeight:0,usedWidth:2,usedHeight:2,indices:[]};layouts.push(page);
    }
    if (page.x + picture.width + 1 > width) {page.x=1;page.y+=page.rowHeight+2;page.rowHeight=0;}
    if (page.y + picture.height + 1 > height) {
      if (layouts.length >= maxPages) throw new Error('Map sprites exceed the atlas page budget.');
      page={x:1,y:1,rowHeight:0,usedWidth:2,usedHeight:2,indices:[]};layouts.push(page);
    }
    entries[index]={page:layouts.length-1,x:page.x,y:page.y,width:picture.width,height:picture.height,dx:picture.dx,dy:picture.dy};
    page.indices.push(index);page.usedWidth=Math.max(page.usedWidth,page.x+picture.width+1);
    page.usedHeight=Math.max(page.usedHeight,page.y+picture.height+1);
    page.x+=picture.width+2;page.rowHeight=Math.max(page.rowHeight,picture.height);
  }
  const pages=layouts.map(layout=>{
    const rgba=Buffer.alloc(layout.usedWidth*layout.usedHeight*4);
    for(const index of layout.indices) {
      const picture=pictures[index],entry=entries[index];
      for(let row=0;row<picture.height;row++) picture.rgba.copy(rgba,((entry.y+row)*layout.usedWidth+entry.x)*4,
        row*picture.width*4,(row+1)*picture.width*4);
    }
    return `data:image/png;base64,${encodeRgbaPng(layout.usedWidth,layout.usedHeight,rgba).toString('base64')}`;
  });
  return {entries,pages};
}
module.exports = { packMapPictures };
