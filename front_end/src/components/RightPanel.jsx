import { useState, useEffect } from "react";
import "../css/RightPanel.css";

const PAIN_TYPES = ["Sharp", "Dull", "Aching", "Burning", "Throbbing", "Shooting", "Cramping"];

export default function RightPanel({
    selectedRegion,
    setSelectedRegion,
    painData,
    setPainData
}) {
    // Local state for the form
    const [severity, setSeverity] = useState(5);
    const [painType, setPainType] = useState("");
    const [notes, setNotes] = useState("");
    const [startDate, setStartDate] = useState("");
    const [frequency, setFrequency] = useState("");

    // Sync local state when a new region is selected
    useEffect(() => {
        if (selectedRegion) {
            const existingData = painData[selectedRegion];
            if (existingData) {
                setSeverity(existingData.severity);
                setPainType(existingData.painType);
                setNotes(existingData.notes);
                setStartDate(existingData.startDate || "");
                setFrequency(existingData.frequency || "");
            } else {
                setSeverity(5);
                setPainType("");
                setNotes("");
                setStartDate("");
                setFrequency("");
            }
        }
    }, [selectedRegion, painData]);

    const handleSave = () => {
        setPainData(prev => ({
            ...prev,
            [selectedRegion]: { severity, painType, notes, startDate, frequency }
        }));
        setSelectedRegion(null); // Close panel on save
    };

    const handleDelete = () => {
        const newData = { ...painData };
        delete newData[selectedRegion];
        setPainData(newData);
        setSelectedRegion(null);
    };

    // Helper to color the severity number
    const getSeverityColor = (val) => {
        if (val <= 3) return "#4caf50"; // Green
        if (val <= 6) return "#ff9800"; // Orange
        return "#f44336"; // Red
    };

    return (

        <aside className="glass-panel panel-right">

            {!selectedRegion ? (

                // No region selected
                <div className="no-selection">
                    <div className="no-sel-icon">🫀</div>
                    <div className="no-sel-title">No Region Selected</div>
                    <div className="no-sel-desc">
                        Select a body region on the 3D model to describe your pain.
                    </div>
                </div>

            ) : (

                // Pain detail form
                <div className="detail-form">

                    <div className="detail-header">
                        <div className="region-icon">📍</div>
                        <div>
                            <div className="region-title">{selectedRegion}</div>
                            <div className="region-subtitle">Describe your pain</div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pain Severity</span>
                            <span style={{ color: getSeverityColor(severity), fontWeight: 'bold' }}>{severity} / 10</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={severity}
                            onChange={(e) => setSeverity(parseInt(e.target.value))}
                            style={{ accentColor: getSeverityColor(severity) }}
                        />
                    </div>

                    <div className="form-section">
                        <div className="form-label">Pain Type</div>
                        <div className="option-pills">
                            {PAIN_TYPES.map(type => (
                                <button 
                                    key={type}
                                    className={`option-pill ${painType === type ? 'active' : ''}`}
                                    onClick={() => setPainType(type)}
                                    style={painType === type ? { background: '#6d5dfc', color: 'white', borderColor: '#6d5dfc' } : {}}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-label">Frequency</div>
                        <select 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#161b2d', color: 'white', border: 'none', cursor: 'pointer' }}
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="">Select frequency...</option>
                            <option value="Constant">Constant</option>
                            <option value="Intermittent">Intermittent</option>
                            <option value="Occasional">Occasional</option>
                            <option value="Rare">Rare</option>
                        </select>
                    </div>

                    <div className="form-section">
                        <div className="form-label">Onset Date</div>
                        <input 
                            type="date"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#161b2d', color: 'white', border: 'none', cursor: 'pointer' }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="form-section">
                        <div className="form-label">Additional Notes</div>
                        <textarea
                            className="notes-textarea"
                            placeholder="Describe symptoms, when it started, what makes it worse..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="detail-actions">
                        <button className="btn btn-primary" onClick={handleSave}>
                            ✓ Save
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete} title="Clear this region">
                            🗑️
                        </button>
                    </div>

                </div>

            )}

        </aside>

    );
}