import "../css/Canvas3D.css";
import "@google/model-viewer";

import { useEffect, useRef, useState } from "react";

const INITIAL_HOTSPOTS = [
  { name: "Head", position: { x: 0, y: 19.024843261539935, z: 0.9744750559329987 } },
  { name: "Neck", position: { x: 0, y: 17.572994317673146, z: 0.9744750559329987 } },
  { name: "Chest", position: { x: 0, y: 15.084110413901508, z: 1.1629800558090209 } },
  { name: "Abdomen", position: { x: 0, y: 11.350784558244051, z: 1.1629800558090209 } },
  { name: "Left Shoulder", position: { x: 3.038100109100342, y: 16.950773341730237, z: 0.03195005655288696 } },
  { name: "Right Shoulder", position: { x: -3.038100109100342, y: 16.950773341730237, z: 0.03195005655288696 } },
  { name: "Left Bicep", position: { x: 4.089750146865844, y: 13.42485447805375, z: 0.03195005655288696 } },
  { name: "Right Bicep", position: { x: -4.089750146865844, y: 13.42485447805375, z: 0.03195005655288696 } },
  { name: "Left Hand", position: { x: 5.1414001846313475, y: 9.27671463843435, z: 0.03195005655288696 } },
  { name: "Right Hand", position: { x: -5.1414001846313475, y: 9.27671463843435, z: 0.03195005655288696 } },
  { name: "Left Thigh", position: { x: 1.4022000503540037, y: 8.239679678529502, z: 0.7105680561065674 } },
  { name: "Right Thigh", position: { x: -1.4022000503540037, y: 8.239679678529502, z: 0.7105680561065674 } },
  { name: "Left Knee", position: { x: 1.4022000503540037, y: 5.128574798814952, z: 0.7105680561065674 } },
  { name: "Right Knee", position: { x: -1.4022000503540037, y: 5.128574798814952, z: 0.7105680561065674 } },
  { name: "Left Calf", position: { x: 1.4022000503540037, y: 3.054504879005253, z: -0.6466679430007934 } },
  { name: "Right Calf", position: { x: -1.4022000503540037, y: 3.054504879005253, z: -0.6466679430007934 } },
  { name: "Upper Back", position: { x: 0, y: 15.498924397863448, z: -1.0236779427528382 } },
  { name: "Lower Back", position: { x: 0, y: 12.387819518148898, z: -1.0236779427528382 } },
  { name: "Glutes", position: { x: 0, y: 9.27671463843435, z: -1.0236779427528382 } }
];

export default function Canvas3D({ setSelectedRegion, setPainData, painData = {} }) {

    const mountRef = useRef(null);
    const viewerRef = useRef(null);
    const [hotspots, setHotspots] = useState(INITIAL_HOTSPOTS);
    const [panMode, setPanMode] = useState(false);
    const [customDotMode, setCustomDotMode] = useState(false);
    const isPanning = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

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
        isPanning.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePanPointerMove = (e) => {
        if (!isPanning.current || !viewerRef.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };

        const target = viewerRef.current.getCameraTarget();
        viewerRef.current.cameraTarget = `${target.x - dx * 0.04}m ${target.y + dy * 0.04}m ${target.z}m`;
    };

    const handlePanPointerUp = (e) => {
        isPanning.current = false;
        e.target.releasePointerCapture(e.pointerId);
    };

    const handleCanvasClick = (e) => {
        if (!customDotMode) return;
        if (!viewerRef.current) return;
        
        const positionAndNormal = viewerRef.current.positionAndNormalFromPoint(e.clientX, e.clientY);
        if (positionAndNormal) {
            const { position } = positionAndNormal;
            
            // Find closest default hotspot
            let closestSpot = INITIAL_HOTSPOTS[0];
            let minDistance = Infinity;
            
            for (const spot of INITIAL_HOTSPOTS) {
                const dist = Math.sqrt(
                    Math.pow(spot.position.x - position.x, 2) +
                    Math.pow(spot.position.y - position.y, 2) +
                    Math.pow(spot.position.z - position.z, 2)
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    closestSpot = spot;
                }
            }

            // Ensure unique names if multiple custom dots are near the same muscle
            let baseName = `Custom (near ${closestSpot.name})`;
            let customName = baseName;
            let counter = 1;
            while (hotspots.some(h => h.name === customName)) {
                counter++;
                customName = `${baseName} ${counter}`;
            }
            
            const newHotspot = {
                name: customName,
                position: position,
                isCustom: true
            };
            
            setHotspots([...hotspots, newHotspot]);
            setSelectedRegion(customName);
            
            // Instantly add to list of pains with default values
            if (setPainData) {
                setPainData(prev => ({
                    ...prev,
                    [customName]: { severity: 5, painType: "", notes: "", startDate: "", frequency: "" }
                }));
            }
            
            setCustomDotMode(false); // Turn off mode after placing one
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

            <div style={{ position: 'absolute', top: '100px', right: '1050px', zIndex: 50 }}>
                <button 
                    style={{ 
                        background: customDotMode ? '#e63946' : '#20263d', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 15px', 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    onClick={() => {
                        setCustomDotMode(!customDotMode);
                        if (!customDotMode) setPanMode(false); // disable pan mode if enabling custom dot
                    }}
                >
                    {customDotMode ? '📌 Click anywhere on body...' : '📌 Add Custom Dot'}
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
                        onPointerMove={handlePanPointerMove}
                        onPointerUp={handlePanPointerUp}
                        onPointerCancel={handlePanPointerUp}
                    />
                )}
                <model-viewer
                    ref={viewerRef}
                    src="/models/FinalBaseMesh.glb"
                    alt="3D model of human body"
                    camera-controls={!customDotMode}
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%', cursor: customDotMode ? 'crosshair' : 'default' }}
                    onClick={handleCanvasClick}
                >
                    {hotspots.filter(spot => !spot.isCustom || painData[spot.name]).map((spot, i) => (
                        <button
                            key={`${i}-${spot.position.x}-${spot.position.y}`}
                            className="hotspot-dot"
                            slot={`hotspot-${i}`}
                            data-position={`${spot.position.x} ${spot.position.y} ${spot.position.z}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Prevent adding a new hotspot when clicking an existing one
                                setSelectedRegion(spot.name);
                            }}
                        >
                            <div className="hotspot-tooltip">{spot.name}</div>
                        </button>
                    ))}
                </model-viewer>
            </div>


        </main>

    );

}