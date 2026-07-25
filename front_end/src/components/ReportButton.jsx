import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportButton({
    patientName,
    patientAge,
    reportDate,
    regions
}) {


    const generatePDF = async () => {

        const doc = new jsPDF();

        const today = reportDate || new Date().toLocaleDateString();

        let y = 20;


        // =========================
        // Header
        // =========================

        doc.setFontSize(20);
        doc.text("Clinical Pain Report", 105, y, {
            align: "center"
        });


        y += 10;

        doc.setFontSize(11);
        doc.text(
            "Comprehensive Patient Pain Assessment",
            105,
            y,
            { align: "center" }
        );


        y += 15;


        // horizontal line

        doc.line(20, y, 190, y);

        y += 15;



        // =========================
        // Patient Information
        // =========================

        doc.setFontSize(14);
        doc.text("1. Patient Information", 20, y);

        y += 10;


        doc.setFontSize(11);

        doc.text(
            `Patient Name: ${patientName || "Not Provided"}`,
            25,
            y
        );

        y += 8;


        doc.text(
            `Age: ${patientAge || "Not Provided"}`,
            25,
            y
        );


        y += 8;


        doc.text(
            `Report Date: ${today}`,
            25,
            y
        );


        y += 15;



        // =========================
        // Pain Assessment
        // =========================

        doc.setFontSize(14);
        doc.text("2. Pain Assessment", 20, y);
        y += 10;

        // Try to capture screenshot of the 3D model
        try {
            const container = document.getElementById('model-viewer-container');
            const viewer = container?.querySelector('model-viewer');
            
            if (viewer && container) {
                // Determine which camera angles we need to photograph
                const requiredAngles = new Set();
                if (regions.length === 0) {
                    requiredAngles.add('0deg 90deg auto'); // Default front
                } else {
                    regions.forEach(([spotId, data]) => {
                        if (data.clickNormal) {
                            const [nx, ny, nz] = data.clickNormal.split(' ').map(Number);
                            if (nz > 0.1) requiredAngles.add('0deg 90deg auto'); // Front
                            if (nz < -0.1) requiredAngles.add('180deg 90deg auto'); // Back
                            if (nx > 0.5) requiredAngles.add('90deg 90deg auto'); // Left
                            if (nx < -0.5) requiredAngles.add('-90deg 90deg auto'); // Right
                        }
                    });
                }
                
                // Fallback
                if (requiredAngles.size === 0) {
                    requiredAngles.add('0deg 90deg auto');
                }

                // Save original orbit so we can restore it later
                const originalOrbit = viewer.getCameraOrbit();
                const originalOrbitStr = `${originalOrbit.theta}rad ${originalOrbit.phi}rad ${originalOrbit.radius}m`;

                for (const angle of requiredAngles) {
                    // Set the camera angle
                    viewer.cameraOrbit = angle;
                    viewer.jumpCameraToGoal();
                    
                    // Wait for the WebGL canvas to fully render the new frame
                    await new Promise(r => setTimeout(r, 200));

                    // Get the 3D scene as an image using the official toBlob API
                    const blob = await viewer.toBlob({ idealAspect: false });
                    const dataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    
                    // Temporarily set the snapshot as the background of the model-viewer
                    const oldBg = viewer.style.backgroundImage;
                    const oldBgSize = viewer.style.backgroundSize;
                    const oldBgPos = viewer.style.backgroundPosition;
                    
                    viewer.style.backgroundImage = `url(${dataUrl})`;
                    viewer.style.backgroundSize = '100% 100%';
                    viewer.style.backgroundPosition = 'center';
                    
                    const canvas = await html2canvas(viewer, {
                        backgroundColor: null,
                        scale: 2
                    });
                    
                    // Clean up
                    viewer.style.backgroundImage = oldBg;
                    viewer.style.backgroundSize = oldBgSize;
                    viewer.style.backgroundPosition = oldBgPos;
                    
                    const finalImage = canvas.toDataURL('image/png');
                    
                    // Calculate dimensions to fit in PDF
                    const pdfWidth = 170; // 190 - 20
                    const imgProps = doc.getImageProperties(finalImage);
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    if (y + pdfHeight > 260) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.addImage(finalImage, 'PNG', 20, y, pdfWidth, pdfHeight);
                    y += pdfHeight + 10;
                }

                // Restore original camera
                viewer.cameraOrbit = originalOrbitStr;
                viewer.jumpCameraToGoal();
            }
        } catch (error) {
            console.error("Screenshot capture failed:", error);
        }
        if (regions.length === 0) {
            doc.setFontSize(11);

            doc.text(
                "No pain regions recorded.",
                25,
                y
            );

        }

        else {


            regions.forEach(([regionName, data], index)=>{


                // check page overflow

                if(y > 260){

                    doc.addPage();
                    y = 20;

                }



                // Region title

                doc.setFontSize(12);

                doc.text(
                    `${index + 1}. ${data.regionName || "Unknown Region"}`,
                    25,
                    y
                );


                y += 8;


                doc.setFontSize(11);



                doc.text(
                    `Pain Severity: ${data.severity}/10`,
                    30,
                    y
                );


                y += 7;



                doc.text(
                    `Pain Type: ${data.painType || "Not specified"}`,
                    30,
                    y
                );


                y += 7;



                if(data.frequency){

                    doc.text(
                        `Frequency: ${data.frequency}`,
                        30,
                        y
                    );

                    y += 7;

                }



                if(data.startDate){

                    doc.text(
                        `Onset Date: ${data.startDate}`,
                        30,
                        y
                    );

                    y += 7;

                }




                if(data.notes){


                    doc.text(
                        "Notes:",
                        30,
                        y
                    );


                    y += 6;


                    // wrap long notes

                    const notes = doc.splitTextToSize(
                        data.notes,
                        150
                    );


                    doc.text(
                        notes,
                        35,
                        y
                    );


                    y += notes.length * 6;

                }



                y += 10;



                // divider

                doc.line(
                    25,
                    y,
                    185,
                    y
                );


                y += 10;


            });

        }



        // =========================
        // Doctor Notes Section
        // =========================


        if(y > 240){

            doc.addPage();
            y = 20;

        }


        doc.setFontSize(14);

        doc.text(
            "3. Clinical Notes",
            20,
            y
        );


        y += 10;


        doc.setFontSize(11);

        doc.text(
            "Additional physician observations:",
            25,
            y
        );


        y += 10;


        doc.rect(
            25,
            y,
            160,
            40
        );


        y += 55;



        // =========================
        // Footer
        // =========================


        doc.setFontSize(9);

        doc.text(
            "Generated by Clinical Pain Assessment System",
            105,
            285,
            {
                align:"center"
            }
        );



        // Save

        doc.save(
            "Clinical_Pain_Report.pdf"
        );

    };



    return (

        <button
            className="btn btn-primary btn-sm"
            onClick={generatePDF}
        >
            🖨️ Print Report
        </button>

    );

}