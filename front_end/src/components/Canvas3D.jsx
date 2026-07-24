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

export default function Canvas3D({ setSelectedRegion }) {

    const mountRef = useRef(null);
    const viewerRef = useRef(null);
    const [hotspots, setHotspots] = useState(INITIAL_HOTSPOTS);
    const [panMode, setPanMode] = useState(false);
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
                        onPointerMove={handlePanPointerMove}
                        onPointerUp={handlePanPointerUp}
                        onPointerCancel={handlePanPointerUp}
                    />
                )}
                <model-viewer
                    ref={viewerRef}
                    src="/models/FinalBaseMesh.glb"
                    alt="3D model of human body"
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%' }}
                >
                    {hotspots.map((spot, i) => (
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