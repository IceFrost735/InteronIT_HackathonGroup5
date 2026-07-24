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
                // Get the 3D scene as an image
                const dataUrl = viewer.toDataURL('image/png', 2.0);
                
                // Temporarily set it as the background to let html2canvas capture it along with the HTML hotspots
                const originalBg = container.style.backgroundImage;
                const originalBgSize = container.style.backgroundSize;
                const originalBgPos = container.style.backgroundPosition;
                const originalBgRepeat = container.style.backgroundRepeat;
                
                container.style.backgroundImage = `url(${dataUrl})`;
                container.style.backgroundSize = 'contain';
                container.style.backgroundPosition = 'center';
                container.style.backgroundRepeat = 'no-repeat';
                
                // Temporarily hide the model-viewer's internal canvas if possible, though html2canvas ignores shadow DOM anyway
                
                const canvas = await html2canvas(container, {
                    backgroundColor: '#f0f4f8',
                    scale: 2 // High resolution
                });
                
                // Restore
                container.style.backgroundImage = originalBg;
                container.style.backgroundSize = originalBgSize;
                container.style.backgroundPosition = originalBgPos;
                container.style.backgroundRepeat = originalBgRepeat;
                
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
                    `${index + 1}. ${regionName}`,
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