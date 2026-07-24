import { useState } from "react";

import TopBar from "./components/TopBar";
import LeftPanel from "./components/LeftPanel";
import Canvas3D from "./components/Canvas3D";
import RightPanel from "./components/RightPanel";
import ReportModal from "./components/ReportModal";


export default function App() {

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [showReport, setShowReport] = useState(false);


    return (

        <>

            <div id="app">

                <TopBar 
                    setShowReport={setShowReport}
                />


                <LeftPanel
                    selectedRegion={selectedRegion}
                />


                <Canvas3D
                    setSelectedRegion={setSelectedRegion}
                />


                <RightPanel
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    setShowReport={setShowReport}
                />


            </div>


            {
                showReport &&
                <ReportModal
                    setShowReport={setShowReport}
                />
            }


        </>

    );
}