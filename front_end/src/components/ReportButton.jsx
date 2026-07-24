import jsPDF from "jspdf";

export default function ReportButton() {


    const generatePDF = () => {

        const doc = new jsPDF();


        doc.setFontSize(20);
        doc.text("Clinical Pain Report", 70, 20);


        doc.setFontSize(12);

        doc.text("Patient Information", 20, 40);

        doc.text("Name: John Doe", 20, 55);
        doc.text("Patient ID: 12345", 20, 65);
        doc.text("Date: 07/24/2026", 20, 75);



        doc.text("Pain Assessment", 20, 95);

        doc.text("Location: Lower Back", 20, 110);
        doc.text("Pain Level: 7/10", 20, 120);

        doc.text(
            "Description: Sharp pain after movement",
            20,
            130
        );



        doc.text("Doctor Notes", 20, 160);

        doc.text(
            "Diagnosis: Muscle strain",
            20,
            175
        );

        doc.text(
            "Treatment: Physical therapy",
            20,
            185
        );


        // Download PDF
        doc.save("Clinical_Pain_Report.pdf");
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