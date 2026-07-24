import "../css/TopBar.css";
export default function TopBar({setShowReport, setPainData}) {

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear all logged pain data?")) {
            setPainData({});
        }
    };

    return (

        <header className="top-bar">

            <div className="logo">

                <div className="logo-icon">
                    🩺
                </div>


                <div>

                    <div className="logo-text">
                        ANATOME
                    </div>

                    <div className="logo-tag">
                        Pain Communication Tool
                    </div>

                </div>

            </div>


            <div className="top-bar-actions">


                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearAll}
                >
                    🗑️ Clear All
                </button>


                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowReport(true)}
                >
                    📋 Generate Report
                </button>


            </div>


        </header>

    );
}