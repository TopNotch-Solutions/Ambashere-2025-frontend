import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { tokens } from "../../../theme";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import EmployeeReport from "./EmployeeReport";
import NewEmployeeReport from "./NewEmployeeReport";
import RetiredEmployeeReport from "./RetiredEmployeeReport";
import EmployeeDemographicsReport from "./EmployeeDemographicsReport";
import EmployeeStatusReport from "./EmployeeStatusReport";
import CostAnalysisReport from "./CostAnalysisReport";
import BudgetReport from "./BudgetReport";
import MonthlyFinancialSummary from "./MonthlyFinancialSummary";
import QuarterlyFinancialSummary from "./QuarterlyFinancialSummary";
import DeviceAllocationReport from "./DeviceAllocationReport";
import PackageUtilizationReport from "./PackageUtilizationReport";
import DeviceDistributionAnalysis from "./DeviceDistributionAnalysis";
import BenefitUtilizationReport from "./BenefitUtilizationReport";
import TrendAnalysisReport from "./TrendAnalysisReport";
import DepartmentalAnalysisReport from "./DepartmentalAnalysisReport";
import ComplianceReport from "./ComplianceReport";
import PendingApprovalsReport from "./PendingApprovalsReport";
import LimitViolationsReport from "./LimitViolationsReport";
import ROIAnalysisReport from "./ROIAnalysisReport";
import CostPerEmployeeReport from "./CostPerEmployeeReport";
import ProgramEffectivenessReport from "./ProgramEffectivenessReport";

const ViewReports = ({ selectedRow, onClose }) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const renderReport = () => {
    switch (selectedRow.id) {
      // Employee Reports
      case 1:
        return <EmployeeReport />;
      case 2:
        return <NewEmployeeReport />;
      case 3:
        return <RetiredEmployeeReport />;
      case 4:
        return <EmployeeDemographicsReport />;
      case 5:
        return <EmployeeStatusReport />;
      
      // Financial Reports
      case 6:
        return <CostAnalysisReport />;
      case 7:
        return <BudgetReport />;
      case 8:
        return <MonthlyFinancialSummary />;
      case 9:
        return <QuarterlyFinancialSummary />;
      
      // Device & Package Reports
      case 10:
        return <DeviceAllocationReport />;
      case 11:
        return <PackageUtilizationReport />;
      case 12:
        return <DeviceDistributionAnalysis />;
      
      // Analytics & Insights Reports
      case 13:
        return <BenefitUtilizationReport />;
      case 14:
        return <TrendAnalysisReport />;
      case 15:
        return <DepartmentalAnalysisReport />;
      
      // Compliance & Audit Reports
      case 16:
        return <ComplianceReport />;
      case 17:
        return <PendingApprovalsReport />;
      case 18:
        return <LimitViolationsReport />;
      
      // ROI Reports
      case 19:
        return <ROIAnalysisReport />;
      case 20:
        return <CostPerEmployeeReport />;
      case 21:
        return <ProgramEffectivenessReport />;
      
      default:
        return <div>No report selected</div>;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="outlined" color="primary" onClick={onClose}>
        <KeyboardBackspaceIcon />
        Back
      </Button>
      {selectedRow && renderReport()}
    </Box>
  );
};

export default ViewReports;
