import { Document, NodeIO } from '@gltf-transform/core';

async function run() {
    const io = new NodeIO();
    const doc = await io.read('./public/models/zanatomy1.glb');
    const root = doc.getRoot();
    
    // We want to translate technical names to clinical names.
    // The user wants simple names like "Bicep", "Abdomen", etc.
    const nameMap = {
        'biceps brachii': 'Bicep',
        'rectus abdominis': 'Abdomen',
        'pectoralis major': 'Pectoralis (Chest)',
        'deltoid': 'Shoulder (Deltoid)',
        'latissimus dorsi': 'Lats (Back)',
        'trapezius': 'Trapezius (Upper Back)',
        'triceps brachii': 'Tricep',
        'quadriceps': 'Quad (Thigh)',
        'rectus femoris': 'Quad (Thigh)',
        'vastus': 'Quad (Thigh)',
        'biceps femoris': 'Hamstring',
        'semitendinosus': 'Hamstring',
        'semimembranosus': 'Hamstring',
        'gluteus maximus': 'Glutes',
        'gastrocnemius': 'Calf',
        'soleus': 'Calf'
    };

    function simplifyName(originalName) {
        let name = originalName.toLowerCase();
        for (const [key, value] of Object.entries(nameMap)) {
            if (name.includes(key)) {
                // Keep the .l or .r suffix if it exists
                if (name.includes('.l')) return value + ' (Left)';
                if (name.includes('.r')) return value + ' (Right)';
                return value;
            }
        }
        
        // Cleanup formatting if no mapping exists
        let clean = originalName.replace(/\.[lr]$/i, (match) => match.toLowerCase() === '.l' ? ' (Left)' : ' (Right)');
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        return clean;
    }

    let clonedCount = 0;
    
    // Iterate over all nodes in the scene
    for (const node of root.listNodes()) {
        const mesh = node.getMesh();
        if (mesh) {
            // For each primitive in the mesh
            for (const prim of mesh.listPrimitives()) {
                const mat = prim.getMaterial();
                if (mat) {
                    // Clone the material so it's unique to this node/muscle
                    const newMat = mat.clone();
                    
                    // Assign the clinical name
                    const clinicalName = simplifyName(node.getName() || mesh.getName() || 'Unknown Muscle');
                    newMat.setName(clinicalName);
                    
                    prim.setMaterial(newMat);
                    clonedCount++;
                }
            }
        }
    }
    
    console.log(`Cloned and renamed ${clonedCount} materials.`);
    
    await io.write('./public/models/zanatomy_split.glb', doc);
    console.log('Saved to zanatomy_split.glb');
}

run().catch(console.error);
