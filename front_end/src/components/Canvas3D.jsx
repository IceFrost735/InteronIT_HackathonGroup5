import "../css/Canvas3D.css";
import "@google/model-viewer";

import { useEffect, useRef, useState } from "react";


export default function Canvas3D({setSelectedRegion}) {


    const mountRef = useRef(null);
    const [modelGender, setModelGender] = useState('male');


    useEffect(() => {


        // Three.js goes here later


    }, []);

    const modelSrc = modelGender === 'male' ? "/models/3d-vh-m-united.glb" : "/models/3d-vh-f-united.glb";

    return (

        <main className="canvas-container">

            <div className="gender-toggle-controls" style={{ position: 'absolute', top: '30px', zIndex: 10, display: 'flex', gap: '5px', background: '#20263d', padding: '5px', borderRadius: '20px', border: '1px solid #333' }}>
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

                <button>
                    Front
                </button>

                <button>
                    Back
                </button>

                <button>
                    Left
                </button>

                <button>
                    Right
                </button>


            </div>



            <div
                ref={mountRef}
                className="three-container"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <model-viewer
                    src={modelSrc}
                    alt="3D model of human body"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%' }}
                ></model-viewer>
            </div>


        </main>

    );

}