import { useState } from "react";

import TopBar from "./components/TopBar";
import LeftPanel from "./components/LeftPanel";
import Canvas3D from "./components/Canvas3D";
import RightPanel from "./components/RightPanel";
import ReportModal from "./components/ReportModal";


export default function App() {

    const [selectedSpotId, setSelectedSpotId] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [painData, setPainData] = useState({});

    return (
        <>
            <div id="app">
                <TopBar setShowReport={setShowReport} setPainData={setPainData} />

                <LeftPanel selectedSpotId={selectedSpotId} painData={painData} setSelectedSpotId={setSelectedSpotId} setPainData={setPainData} />

                <Canvas3D setSelectedSpotId={setSelectedSpotId} setPainData={setPainData} painData={painData} />

                <RightPanel
                    selectedSpotId={selectedSpotId}
                    setSelectedSpotId={setSelectedSpotId}
                    setShowReport={setShowReport}
                    painData={painData}
                    setPainData={setPainData}
                />
            </div>


            {
                showReport &&
                <ReportModal
                    setShowReport={setShowReport}
                    painData={painData}
                />
            }


        </>

    );
}