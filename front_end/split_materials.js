import { Document, NodeIO } from '@gltf-transform/core';

async function run() {
    const io = new NodeIO();
    const doc = await io.read('./public/models/zanatomy1.glb');
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
                    
                    // Introduce a microscopic difference to prevent gltf-transform from deduplicating identical L/R materials
                    const color = newMat.getBaseColorFactor() || [1, 1, 1, 1];
                    color[3] = 1.0 - (Math.random() * 0.00001);
                    newMat.setBaseColorFactor(color);
                    
                    // Assign the clinical name
                    const clinicalName = simplifyName(node.getName() || mesh.getName() || 'Unknown Muscle');
                    newMat.setName(clinicalName);
                    
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
