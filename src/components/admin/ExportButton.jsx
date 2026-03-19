import React from "react";
import * as XLSX from "xlsx/xlsx.mjs";
import { FaDownload } from "react-icons/fa";
import "../../App.css";
import Button from "react-bootstrap/Button";

const ExportButton = ({ data = [], fileName, className = "" }) => {
  const defaultStyle = {
    fontSize: "13px",
    height: "100%",
    background: "linear-gradient(to right, #1A69AC, #00AAE9)",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    borderColor: "#0f69ac",
    border: "1px solid #0f69ac",
    fontWeight: 700,
  };

  return (
    <Button
      className={`download-btn ${className}`.trim()}
      onClick={() => {
        const datas = data?.length ? data : [];
        const worksheet = XLSX.utils.json_to_sheet(datas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, fileName ? `${fileName}.xlsx` : "data.xlsx");
      }}
      style={className ? undefined : defaultStyle}
    >
      Export
      <FaDownload size={16} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default ExportButton;
