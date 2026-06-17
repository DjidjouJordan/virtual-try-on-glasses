const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\user\\virtual-try-on-glasses\\frontend\\public\\models\\canonical_face_model.obj', 'utf8');
const lines = content.split('\n');

let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;
let minZ = Infinity, maxZ = -Infinity;

for (const line of lines) {
  if (line.startsWith('v ')) {
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    if (parts.length >= 3) {
      const [x, y, z] = parts;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }
}

console.log('--- Canonical Face Model Bounding Box ---');
console.log(`X: [${minX}, ${maxX}] -> Width: ${maxX - minX}`);
console.log(`Y: [${minY}, ${maxY}] -> Height: ${maxY - minY}`);
console.log(`Z: [${minZ}, ${maxZ}] -> Depth: ${maxZ - minZ}`);
