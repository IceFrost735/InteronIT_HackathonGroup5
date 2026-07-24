const fs = require('fs');
const buffer = fs.readFileSync('front_end/public/models/FinalBaseMesh.glb');
const magic = buffer.readUInt32LE(0);
if (magic !== 0x46546C67) { console.log('Not a GLB'); process.exit(1); }
const jsonChunkLength = buffer.readUInt32LE(12);
const jsonChunkType = buffer.readUInt32LE(16);
if (jsonChunkType !== 0x4E4F534A) { console.log('First chunk is not JSON'); process.exit(1); }
const jsonBuffer = buffer.slice(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));
console.log('Meshes:', gltf.meshes ? gltf.meshes.length : 0);
if (gltf.meshes) {
    gltf.meshes.forEach((m, i) => {
        console.log(` Mesh ${i}: ${m.name || 'unnamed'}`);
        if (m.primitives) {
            console.log(`  Primitives: ${m.primitives.length}`);
            m.primitives.forEach((p, j) => {
                console.log(`   Primitive ${j} material index: ${p.material}`);
            });
        }
    });
}
console.log('Materials:', gltf.materials ? gltf.materials.length : 0);
if (gltf.materials) {
    gltf.materials.forEach((m, i) => console.log(` Material ${i}: ${m.name || 'unnamed'}`));
}
