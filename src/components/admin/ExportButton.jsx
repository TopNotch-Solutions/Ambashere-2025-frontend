import React from "react";
import * as XLSX from "xlsx/xlsx.mjs";
import { FaDownload } from "react-icons/fa";
import "../../App.css";
import Button from "react-bootstrap/Button";

const ExportButton = ({ data = [], fileName }) => {
  return (
    <Button
      className="download-btn"
      onClick={() => {
        const datas = data?.length ? data : [];
        const worksheet = XLSX.utils.json_to_sheet(datas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, fileName ? `${fileName}.xlsx` : "data.xlsx");
      }}
      style={{
        fontSize: "13px",
        height: " 100%",
        backgroundColor: "#0096D6",
        color: "#fff",
        padding: "8px",
        paddingLeft: "30px",
        paddingRight: "30px",
        borderRadius: "5px",
        cursor: "pointer",
        // marginRight: "10px",
        borderColor: "#1A69AC",
        border: "1px solid",
        
      }}
    >
      Export
      <FaDownload size={16} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default ExportButton;
