import "../css/Canvas3D.css";
import "@google/model-viewer";

import { useEffect, useRef, useState } from "react";

export default function Canvas3D({ setSelectedRegion, setPainData, painData = {} }) {

    const mountRef = useRef(null);
    const viewerRef = useRef(null);
    const [panMode, setPanMode] = useState(false);
    const isPanning = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    
    const originalColors = useRef({});
    const hoveredMaterial = useRef(null);

    // Synchronize materials with painData
    useEffect(() => {
        try {
            if (viewerRef.current && viewerRef.current.model) {
                const materials = viewerRef.current.model.materials;
                for (const material of materials) {
                    try {
                        // Accessing pbrMetallicRoughness can throw if the material isn't fully loaded by model-viewer
                        const pbr = material.pbrMetallicRoughness;
                        if (!pbr) continue;

                        // Hide and ignore Fascia and non-muscle tissues that block the view
                        if (['Fascia', 'Bursa', 'Cartilage'].includes(material.name)) {
                            pbr.setBaseColorFactor([0, 0, 0, 0]);
                            if (typeof material.setAlphaMode === 'function') material.setAlphaMode('MASK');
                            if (typeof material.setAlphaCutoff === 'function') material.setAlphaCutoff(1.0);
                            continue;
                        }

                        if (!originalColors.current[material.name]) {
                            originalColors.current[material.name] = pbr.baseColorFactor.slice();
                        }

                        let targetColor = originalColors.current[material.name];
                        
                        const pain = painData[material.name];
                        if (pain) {
                            targetColor = [1, 0.2, 0.2, 1]; // Default Red
                            if (pain.severity <= 3) targetColor = [0.3, 0.8, 0.3, 1]; // Green
                            else if (pain.severity <= 6) targetColor = [1, 0.6, 0, 1]; // Orange
                        } else if (hoveredMaterial.current === material.name) {
                            targetColor = [0.3, 0.6, 1.0, 1]; // Hover glow
                        }

                        // ONLY update WebGL if the color actually changed (prevents browser freezing)
                        const currentColor = pbr.baseColorFactor;
                        if (!currentColor || targetColor[0] !== currentColor[0] || targetColor[1] !== currentColor[1] || targetColor[2] !== currentColor[2] || targetColor[3] !== currentColor[3]) {
                            pbr.setBaseColorFactor(targetColor);
                        }
                    } catch (e) {
                        // Silently skip materials that haven't finished lazy-loading in WebGL yet
                        continue;
                    }
                }
            }
        } catch (error) {
            alert("Effect Error: " + error.message + "\n" + error.stack);
        }
    }, [painData]);

    useEffect(() => {
        const handleNativeWheel = (e) => {
            if (panMode && viewerRef.current) {
                e.preventDefault(); 
                const orbit = viewerRef.current.getCameraOrbit();
                const newRadius = Math.max(0.1, orbit.radius + (e.deltaY * 0.005));
                viewerRef.current.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${newRadius}m`;
            }
        };

        const container = mountRef.current;
        if (container) {
            container.addEventListener('wheel', handleNativeWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleNativeWheel);
            }
        };
    }, [panMode]);

    const setCameraAngle = (orbitStr) => {
        if (viewerRef.current) {
            viewerRef.current.cameraTarget = 'auto auto auto';
            viewerRef.current.cameraOrbit = orbitStr;
        }
    };

    const handlePanPointerDown = (e) => {
        if (panMode) {
            isPanning.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            e.target.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e) => {
        if (isPanning.current && viewerRef.current && panMode) {
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            lastPos.current = { x: e.clientX, y: e.clientY };

            const target = viewerRef.current.getCameraTarget();
            viewerRef.current.cameraTarget = `${target.x - dx * 0.04}m ${target.y + dy * 0.04}m ${target.z}m`;
            return;
        }

        // Hover logic
        if (!panMode && viewerRef.current && viewerRef.current.model) {
            const material = viewerRef.current.materialFromPoint(e.clientX, e.clientY);
            let newHover = material ? material.name : null;
            
            if (['Fascia', 'Bursa', 'Cartilage'].includes(newHover)) {
                newHover = null;
            }
            
            if (newHover !== hoveredMaterial.current) {
                const oldHover = hoveredMaterial.current;
                hoveredMaterial.current = newHover;
                
                // Revert old hover if it's not currently tracked in painData
                if (oldHover && !painData[oldHover]) {
                    const oldMat = viewerRef.current.model.materials.find(m => m.name === oldHover);
                    if (oldMat && originalColors.current[oldHover]) {
                        try {
                            oldMat.pbrMetallicRoughness.setBaseColorFactor(originalColors.current[oldHover]);
                        } catch (e) {}
                    }
                }
                
                // Apply new hover if it's not currently tracked in painData
                if (newHover && !painData[newHover]) {
                    const newMat = viewerRef.current.model.materials.find(m => m.name === newHover);
                    if (newMat) {
                        try {
                            if (!originalColors.current[newHover]) {
                                originalColors.current[newHover] = newMat.pbrMetallicRoughness.baseColorFactor.slice();
                            }
                            // Highlight with a light blue glow
                            newMat.pbrMetallicRoughness.setBaseColorFactor([0.3, 0.6, 1.0, 1]); 
                        } catch (e) {}
                    }
                }
            }
        }
    };

    const handlePanPointerUp = (e) => {
        isPanning.current = false;
        e.target.releasePointerCapture(e.pointerId);
    };

    const handleCanvasClick = (e) => {
        try {
            if (panMode) return;
            if (!viewerRef.current) return;
            
            const material = viewerRef.current.materialFromPoint(e.clientX, e.clientY);
            if (material && material.name && !['Fascia', 'Bursa', 'Cartilage'].includes(material.name)) {
                const name = material.name;
                setSelectedRegion(name);
                
                // Instantly add to list of pains with default values if it doesn't exist
                if (setPainData && !painData[name]) {
                    setPainData(prev => ({
                        ...prev,
                        [name]: { severity: 5, painType: "", notes: "", startDate: "", frequency: "" }
                    }));
                }
            }
        } catch (error) {
            alert("Click Error: " + error.message + "\n" + error.stack);
        }
    };

    return (

        <main className="canvas-container" style={{ touchAction: 'none', overscrollBehavior: 'none', paddingLeft: '280px', paddingRight: '330px' }}>

            <div className="view-controls" style={{ zIndex: 50 }}>

                <button onClick={() => setCameraAngle('0deg 90deg auto')}>
                    Front
                </button>

                <button onClick={() => setCameraAngle('180deg 90deg auto')}>
                    Back
                </button>

                <button onClick={() => setCameraAngle('90deg 90deg auto')}>
                    Left
                </button>

                <button onClick={() => setCameraAngle('-90deg 90deg auto')}>
                    Right
                </button>

                <div style={{ width: '1px', background: '#ffffff33', margin: '0 5px' }}></div>
                
                <button 
                    style={{ background: panMode ? '#6d5dfc' : 'transparent', border: panMode ? '1px solid #6d5dfc' : '1px solid #ffffff33', transition: 'all 0.2s' }}
                    onClick={() => setPanMode(!panMode)}
                >
                    {panMode ? '🖐 Panning Active' : '🖐 Enable Pan Tool'}
                </button>

            </div>

            <div
                ref={mountRef}
                className="three-container"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '120px', paddingBottom: '60px', boxSizing: 'border-box', position: 'relative' }}
            >
                {panMode && (
                    <div 
                        style={{ position: 'absolute', inset: 0, zIndex: 20, cursor: 'grab', touchAction: 'none' }}
                        onPointerDown={handlePanPointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePanPointerUp}
                        onPointerCancel={handlePanPointerUp}
                    />
                )}
                <model-viewer
                    ref={viewerRef}
                    src="/models/zanatomy_split.glb"
                    alt="3D muscular model"
                    camera-controls={!panMode}
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%', cursor: panMode ? 'default' : 'pointer' }}
                    onClick={handleCanvasClick}
                    onPointerMove={!panMode ? handlePointerMove : undefined}
                >
                </model-viewer>
            </div>

        </main>

    );

}