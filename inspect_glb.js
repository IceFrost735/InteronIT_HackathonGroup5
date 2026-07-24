const fs = require('fs');
const filePath = 'front_end/public/models/zanatomy.glb';
const buffer = fs.readFileSync(filePath);
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonBuffer = buffer.slice(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

console.log('Inspecting Materials:');
gltf.materials.forEach((m, i) => {
    if (['Text', 'Directions', 'Text-2', 'Lines'].includes(m.name)) {
        console.log(`Material ${i} (${m.name}):`, JSON.stringify(m, null, 2));
    }
});
