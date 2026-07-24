import "../css/LeftPanel.css";

export default function LeftPanel({selectedRegion}) {


    return (

        <aside className="glass-panel panel-left">


            <div className="panel-title">
                Selected Regions
            </div>



            <div className="panel-summary">


                <div className="summary-stat">

                    <div className="stat-value">
                        {
                            selectedRegion ? 1 : 0
                        }
                    </div>


                    <div className="stat-label">
                        Regions
                    </div>


                </div>


                <div className="summary-stat">

                    <div className="stat-value">
                        —
                    </div>

                    <div className="stat-label">
                        Avg Severity
                    </div>


                </div>


            </div>



            <div className="region-list">


                {
                    selectedRegion ? (

                        <div>
                            {selectedRegion.name}
                        </div>

                    ) : (

                        <div className="empty-state">

                            <div>
                                👆
                            </div>

                            <div>
                                Click on the 3D body model to indicate where you feel pain.
                            </div>


                        </div>

                    )
                }


            </div>



        </aside>

    );
}