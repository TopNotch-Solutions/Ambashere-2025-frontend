import React from "react";
import { FaDownload } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import jsPDF from "jspdf";
import "jspdf-autotable"; // This imports the autotable plugin for jsPDF

const DownloadButton = ({ data = [], fileName }) => {
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Convert data to an array of arrays suitable for autoTable
    const tableData = data.map(Object.values);
    const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
    });

    doc.save(fileName ? `${fileName}.pdf` : "data.pdf");
  };

  return (
    <Button
      className="download-btn"
      onClick={downloadPDF}
      style={{
        fontSize: "13px",
        height: "100%",
        backgroundColor: "#D73832",
        color: "#fff",
        padding: "8px",
        paddingLeft: "10px",
        borderRadius: "5px",
        cursor: "pointer",
        borderColor: "#1A69AC",
        border: "1px solid",
      }}
    >
      Download
      <FaDownload size={16} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default DownloadButton;
