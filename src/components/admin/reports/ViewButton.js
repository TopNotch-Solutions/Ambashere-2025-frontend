// ViewButton.jsx
import React from "react";
import { Button } from "@mui/material";
import { FaEye} from "react-icons/fa";

const ViewButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{
        background: "linear-gradient(to right, #1A69AC, #00AAE9)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        border: "1px solid #0f69ac",
        textTransform: "none",
        fontWeight: 700,
      }}
    >
      View
      <FaEye size={14} style={{ marginLeft: "10px" }} />
    </Button>
  );
};

export default ViewButton;



// BenefitVoucher