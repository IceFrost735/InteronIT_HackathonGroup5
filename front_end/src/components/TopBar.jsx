import "../css/TopBar.css";
export default function TopBar({setShowReport}) {

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