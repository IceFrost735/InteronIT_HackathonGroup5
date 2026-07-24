import { useState } from "react";
import "../css/ReportModal.css";
import ReportButton from "./ReportButton";

export default function ReportModal({ setShowReport, painData }) {
    const [patientName, setPatientName] = useState("");
    const [patientAge, setPatientAge] = useState("");
    
    const regions = Object.entries(painData || {});

    return (
        <div className="report-overlay">
            <div className="report-modal">

                {/* Header */}
                <div className="report-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>📋 Clinical Pain Report</h2>
                    <button className="report-close-btn" onClick={() => setShowReport(false)}>✕</button>
                </div>

                {/* Body */}
                <div className="report-modal-body">
                    
                    {/* Patient Info Section */}
                    <div className="patient-info-section">
                        <div className="info-group">
                            <label>Patient Name:</label>
                            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full Name" />
                        </div>
                        <div className="info-group">
                            <label>Age:</label>
                            <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Age" />
                        </div>
                        <div className="info-group">
                            <label>Date:</label>
                            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <hr className="report-divider" />

                    <h3>Pain Assessment</h3>

                    {regions.length === 0 ? (
                        <div className="report-empty">
                            No pain regions recorded. Select regions on the 3D model to add them to this report.
                        </div>
                    ) : (
                        <div className="pain-list">
                            {regions.map(([regionName, data]) => (
                                <div key={regionName} className="pain-item">
                                    <div className="pain-item-header">
                                        <span className="pain-item-title">📍 {regionName}</span>
                                        <span className="pain-item-severity" style={{
                                            backgroundColor: data.severity <= 3 ? '#4caf50' : data.severity <= 6 ? '#ff9800' : '#f44336'
                                        }}>
                                            Severity: {data.severity}/10
                                        </span>
                                    </div>
                                    <div className="pain-item-details">
                                        <p><strong>Type:</strong> {data.painType || "Not specified"}</p>
                                        {data.frequency && <p><strong>Frequency:</strong> {data.frequency}</p>}
                                        {data.startDate && <p><strong>Onset Date:</strong> {data.startDate}</p>}
                                        {data.notes && <p><strong>Notes:</strong> {data.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="report-modal-footer">

                    <ReportButton
                        patientName={patientName}
                        patientAge={patientAge}
                        regions={regions}
                    />
                </div>

            </div>
        </div>
    );
}