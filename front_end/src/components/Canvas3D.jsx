import "../css/Canvas3D.css";

import { useEffect, useRef } from "react";


export default function Canvas3D({setSelectedRegion}) {


    const mountRef = useRef(null);


    useEffect(() => {


        // Three.js goes here later


    }, []);



    return (

        <main className="canvas-container">


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
            />


        </main>

    );

}