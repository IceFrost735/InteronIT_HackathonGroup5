import "../css/ReportModal.css";

export default function ReportModal({ setShowReport }) {

    return (
        <div className="report-overlay">

            <div className="report-modal">


                {/* Header */}
                <div className="report-modal-header">

                    <h2>
                        📋 Clinical Pain Report
                    </h2>


                    <button
                        className="report-close-btn"
                        onClick={() => setShowReport(false)}
                    >
                        ✕
                    </button>

                </div>



                {/* Body */}
                <div className="report-modal-body">


                    <div className="report-empty">

                        No pain regions selected.

                    </div>


                    {/* Later this will map selected regions */}
                    {/*
                    
                    selectedRegions.map(region => (
                        <div>
                            {region.name}
                            {region.severity}
                        </div>
                    ))

                    */}


                </div>




                {/* Footer */}
                <div className="report-modal-footer">


                    <button
                        className="btn btn-secondary btn-sm"
                    >
                        ⬇️ Download
                    </button>


                    <button
                        className="btn btn-primary btn-sm"
                    >
                        🖨️ Print Report
                    </button>


                </div>



            </div>

        </div>
    );
}