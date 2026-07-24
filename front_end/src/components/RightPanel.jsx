import "../css/RightPanel.css";

export default function RightPanel({
    selectedRegion,
    setSelectedRegion
}) {

    return (

        <aside className="glass-panel panel-right">


            {!selectedRegion ? (

                // No region selected
                <div className="no-selection">

                    <div className="no-sel-icon">
                        🫀
                    </div>

                    <div className="no-sel-title">
                        No Region Selected
                    </div>

                    <div className="no-sel-desc">
                        Select a body region on the 3D model to describe your pain.
                    </div>

                </div>


            ) : (


                // Pain detail form
                <div className="detail-form">


                    <div className="detail-header">

                        <div className="region-icon">
                            {selectedRegion.icon}
                        </div>


                        <div>

                            <div className="region-title">
                                {selectedRegion.name}
                            </div>


                            <div className="region-subtitle">
                                Describe your pain
                            </div>

                        </div>


                    </div>



                    <div className="form-section">

                        <div className="form-label">
                            Pain Severity
                        </div>


                        <input
                            type="range"
                            min="1"
                            max="10"
                        />

                    </div>




                    <div className="form-section">

                        <div className="form-label">
                            Pain Type
                        </div>


                        <div className="option-pills">

                            <button className="option-pill">
                                Sharp
                            </button>

                            <button className="option-pill">
                                Burning
                            </button>

                            <button className="option-pill">
                                Aching
                            </button>

                        </div>

                    </div>




                    <div className="form-section">

                        <div className="form-label">
                            Additional Notes
                        </div>


                        <textarea
                            className="notes-textarea"
                            placeholder="Describe symptoms..."
                        />

                    </div>




                    <div className="detail-actions">


                        <button
                            className="btn btn-primary"
                        >
                            ✓ Save
                        </button>


                        <button
                            className="btn btn-danger"
                            onClick={() => setSelectedRegion(null)}
                        >
                            🗑️
                        </button>


                    </div>



                </div>


            )}



        </aside>

    );

}