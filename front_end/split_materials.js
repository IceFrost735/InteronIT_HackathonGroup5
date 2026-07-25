import { Document, NodeIO } from '@gltf-transform/core';

async function run() {
    const io = new NodeIO();
    const doc = await io.read('./public/models/zanatomycolored.glb');
    const root = doc.getRoot();
    
    // We want to keep the specific anatomical names (as they are medically distinct)
    // but format them nicely for the UI.
    function simplifyName(originalName) {
        // Remove the .l or .r at the end, and append (Left) or (Right)
        let clean = originalName.replace(/\.[lr]$/i, (match) => match.toLowerCase() === '.l' ? ' (Left)' : ' (Right)');
        
        // Remove some redundant words like "muscle" or "part of" to keep UI clean
        clean = clean.replace(/ muscle/ig, '');
        clean = clean.replace(/part of /ig, '');
        
        // Capitalize the first letter
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        
        return clean.trim();
    }

    let clonedCount = 0;
    
    // Keep track of meshes we've already modified so we can clone them if shared
    const processedMeshes = new Set();
    
    // Iterate over all nodes in the scene
    for (const node of root.listNodes()) {
        let mesh = node.getMesh();
        if (mesh) {
            
            // If this mesh is shared (already processed by a previous node, like the Left side),
            // we MUST explicitly clone its primitives so the Right side can have its own independent materials!
            if (processedMeshes.has(mesh)) {
                const oldMesh = mesh;
                mesh = doc.createMesh(oldMesh.getName());
                for (const prim of oldMesh.listPrimitives()) {
                    mesh.addPrimitive(prim.clone());
                }
                node.setMesh(mesh);
            }
            processedMeshes.add(mesh);

            // For each primitive in the mesh
            for (const prim of mesh.listPrimitives()) {
                const mat = prim.getMaterial();
                if (mat) {
                    // Clone the material so it's unique to this node/muscle
                    const newMat = mat.clone();
                    
                    // Assign the clinical name
                    const clinicalName = simplifyName(node.getName() || mesh.getName() || 'Unknown Muscle');
                    newMat.setName(clinicalName);
                    
                    // Assign intelligent colors based on anatomy name
                    const nameLower = clinicalName.toLowerCase();
                    let baseColor = [0.25, 0.02, 0.02, 1.0]; // Default fleshy muscle red
                    let roughness = 0.5;
                    let metallic = 0.0;
                    
                    if (nameLower.includes('fascia') || nameLower.includes('aponeurosis') || nameLower.includes('sheath')) {
                        baseColor = [0.85, 0.85, 0.8, 0.2]; // Highly transparent off-white
                        roughness = 0.7;
                        newMat.setAlphaMode('BLEND');
                    } else if (nameLower.includes('tendon') || nameLower.includes('ligament') || nameLower.includes('linea')) {
                        baseColor = [0.7, 0.7, 0.65, 1.0]; // Solid off-white for tendons
                        roughness = 0.6;
                    } else if (nameLower.includes('cartilage') || nameLower.includes('disc')) {
                        baseColor = [0.5, 0.6, 0.7, 1.0]; // Light bluish-white
                        roughness = 0.3;
                    } else if (nameLower.includes('bone') || nameLower.includes('vertebra')) {
                        baseColor = [0.75, 0.7, 0.65, 1.0]; // Bone ivory
                        roughness = 0.8;
                    } else if (nameLower.includes('vein') || nameLower.includes('vena')) {
                        baseColor = [0.01, 0.02, 0.25, 1.0]; // Deep Blue
                        roughness = 0.4;
                    } else if (nameLower.includes('artery') || nameLower.includes('aorta')) {
                        baseColor = [0.4, 0.01, 0.01, 1.0]; // Bright Red
                        roughness = 0.4;
                    } else if (nameLower.includes('nerve')) {
                        baseColor = [0.5, 0.4, 0.02, 1.0]; // Bright Yellow
                        roughness = 0.5;
                    } else {
                        // Muscles - Deep rich red in linear space
                        baseColor = [0.25, 0.02, 0.02, 1.0];
                        roughness = 0.5;
                    }
                    
                    // Add micro variation to prevent deduplication of identical L/R materials
                    baseColor[3] = 1.0 - (Math.random() * 0.00001);
                    
                    newMat.setBaseColorFactor(baseColor);
                    newMat.setRoughnessFactor(roughness);
                    newMat.setMetallicFactor(metallic);
                    
                    prim.setMaterial(newMat);
                    clonedCount++;
                }
            }
        }
    }
    
    console.log(`Cloned and renamed ${clonedCount} materials. Total unique meshes: ${processedMeshes.size}`);
    
    await io.write('./public/models/zanatomy_split.glb', doc);
    console.log('Saved to zanatomy_split.glb');
}

run().catch(console.error);
