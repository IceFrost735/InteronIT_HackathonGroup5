import { useState } from "react";

import TopBar from "./components/TopBar";
import LeftPanel from "./components/LeftPanel";
import Canvas3D from "./components/Canvas3D";
import RightPanel from "./components/RightPanel";
import ReportModal from "./components/ReportModal";
import Questionnaire from "./components/Questionnaire";

export default function App() {
  // Despite its name, this stores the generated spot ID
  const [selectedRegion, setSelectedRegion] = useState(null);

  const [showReport, setShowReport] = useState(false);
  const [painData, setPainData] = useState({});

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(null);

  const [showQuestionnaire, setShowQuestionnaire] = useState(true);

  function finishQuestionnaire(answers) {
    console.log("Saved questionnaire answers:", answers);

    setQuestionnaireAnswers(answers);
    setShowQuestionnaire(false);
  }

  const handleClearAll = () => {
    setPainData({});
    setSelectedRegion(null);
  };

  return (
    <>
      {showQuestionnaire ? (
        <Questionnaire onFinish={finishQuestionnaire} />
      ) : (
        <>
          <div id="app">
            <TopBar
              setShowReport={setShowReport}
              setPainData={setPainData}
              setSelectedRegion={setSelectedRegion}
              onClearAll={handleClearAll}
            />

            <LeftPanel
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              painData={painData}
              setPainData={setPainData}
            />

            <Canvas3D
              setSelectedRegion={setSelectedRegion}
              setPainData={setPainData}
              painData={painData}
            />

            <RightPanel
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              painData={painData}
              setPainData={setPainData}
            />
          </div>

          {showReport && (
            <ReportModal
              setShowReport={setShowReport}
              painData={painData}
              questionnaireAnswers={questionnaireAnswers}
            />
          )}
        </>
      )}
    </>
  );
}
