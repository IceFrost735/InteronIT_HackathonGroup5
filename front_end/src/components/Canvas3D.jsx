import "../css/Canvas3D.css";
import "@google/model-viewer";

import { useEffect, useRef, useState } from "react";


export default function Canvas3D({setSelectedRegion}) {


    const mountRef = useRef(null);
    const viewerRef = useRef(null);
    const [modelGender, setModelGender] = useState('male');


    useEffect(() => {


        // Three.js goes here later


    }, []);

    const modelSrc = modelGender === 'male' ? "/models/3d-vh-m-united.glb" : "/models/3d-vh-f-united.glb";

    const setCameraAngle = (orbitStr) => {
        if (viewerRef.current) {
            viewerRef.current.cameraOrbit = orbitStr;
        }
    };

    return (

        <main className="canvas-container">

            <div className="gender-toggle-controls" style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '5px', background: '#20263d', padding: '5px', borderRadius: '20px', border: '1px solid #333' }}>
                <button 
                    onClick={() => setModelGender('male')}
                    style={{ padding: '8px 16px', borderRadius: '15px', border: 'none', background: modelGender === 'male' ? '#6d5dfc' : 'transparent', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                    Male
                </button>
                <button 
                    onClick={() => setModelGender('female')}
                    style={{ padding: '8px 16px', borderRadius: '15px', border: 'none', background: modelGender === 'female' ? '#6d5dfc' : 'transparent', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                    Female
                </button>
            </div>

            <div className="view-controls">

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


            </div>



            <div
                ref={mountRef}
                className="three-container"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '120px', paddingBottom: '60px', boxSizing: 'border-box' }}
            >
                <model-viewer
                    ref={viewerRef}
                    src={modelSrc}
                    alt="3D model of human body"
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%' }}
                ></model-viewer>
            </div>


        </main>

    );

}