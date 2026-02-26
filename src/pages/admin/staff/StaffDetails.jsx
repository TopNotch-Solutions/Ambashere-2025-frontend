// StaffDetails.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Personal from "./Personal";
import AirtimeBenefits from "./AirtimeBenefits";
import HandsetBenefits from "./HandsetBenefits";
import CurrentPlans from "./CurrentPlans";
import StaffMenu from "./StaffMenu";
import { Box } from "@mui/material";
import { EmployeeCodeProvider } from "./EmployeeCodeContext";

const StaffDetails = () => {
  const { employeeCode } = useParams();
  const [selectedTab, setSelectedTab] = useState("personal");

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  let content = null;
  switch (selectedTab) {
    case "personal":
      content = <Personal />;
      break;
    case "handsetBenefits":
      content = <HandsetBenefits />;
      break;
    case "airtimeBenefits":
      content = <AirtimeBenefits />;
      break;
    case "currentPlans":
      content = <CurrentPlans />;
      break;
    default:
      content = null;
  }

  return (
    <Box m="20px">
      <EmployeeCodeProvider>
        <StaffMenu selectedTab={selectedTab} onTabChange={handleTabChange} />
        {content}
      </EmployeeCodeProvider>
    </Box>
  );
};

export default StaffDetails;
