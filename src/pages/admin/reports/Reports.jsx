import { Box, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ViewReports from "../../../components/admin/reports/ViewReports";
import ViewButton from "../../../components/admin/reports/ViewButton";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";
import "../../../assets/style/global/adminReports.css";

const AdminReports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xl"));
  const [selectedRow, setSelectedRow] = useState(null);

  const lines = [
    // Employee Reports
    "All Employees Report",
    "New Employees Report", 
    "Retired Employees Report",
    "Employee Demographics Report",
    "Employee Status Report",
    
    // Financial Reports
    "Cost Analysis Report",
    "Budget Report",
    "Monthly Financial Summary",
    "Quarterly Financial Summary",
    
    // Device & Package Reports
    "Device Allocation Report",
    "Package Utilization Report",
    "Device Distribution Analysis",
    
    // Analytics & Insights Reports
    "Benefit Utilization Report",
    "Trend Analysis Report",
    "Departmental Analysis Report",
    
    // Compliance & Audit Reports
    "Compliance Overview Report",
    "Pending Approvals Report",
    "Limit Violations Report",
    
    // ROI Reports
    "ROI Analysis Report",
    "Cost Per Employee Report",
    "Program Effectiveness Report",
  ];

  const columns = [
    { field: "id", headerName: "#", type: "number", width: 140 },
    { field: "reportName", headerName: "REPORT NAME", width: isSmallScreen ? 400 : 800},
    {
      field: "action",
      headerName: "ACTION",
      width: 250,
      headerAlign: 'center',
      renderCell: (params) => (
        <Box display="flex" justifyContent="flex-end" width="100%">
          <ViewButton onClick={() => handleRowClick(params.row)} />
        </Box>
      ),
    },
  ];

  const rows = lines.map((line, index) => ({
    id: index + 1, // Assuming you want incremental IDs starting from 1
    reportName: line,
    action: "", // Assuming you want an empty action field for now
  }));

  const handleRowClick = (row) => {
    setSelectedRow(row);
  };

  const renderContent = () => {
    if (selectedRow) {
      // Render ViewTable with selected data
      return (
        <ViewReports
          selectedRow={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      );
    } else {
      // Render normal DataGrid
      return (
        <Box className="admin-reports-wrap">
          <div style={{ display: "flex" }}>
            <Box
              m="20px 0 0 0"
              height=""
              textAlign={"center"}
              justifyContent={"center"}
              className="handset-form-card shadow-sm benefits-table-card"
              sx={{
                width: "100%",
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
                "& .name-column--cell": {
                  color: colors.greenAccent[300],
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1674BB",
                  borderBottom: "none",
                  color: "white",
                },
                "& .MuiDataGrid-virtualScroller": {
                  //   backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "none",
                  //   backgroundColor: colors.grey[900],
                },
                "& .MuiCheckbox-root": {
                  color: `${colors.greenAccent[200]} !important`,
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  color: `${colors.grey[100]} !important`,
                },
              }}
            >
              <div className="benefits-grid-wrap">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  disableSelectionOnClick
                  onRowClick={(params, event) => {
                    handleRowClick(params.row);
                  }}
                  hideFooter
                />
              </div>
            </Box>
          </div>
        </Box>
      );
    }
  };

  return (
    <Box m="20px" sx={{ width: "auto" }} className="handset-simulator-page admin-reports-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Reports</h2>
          <p className="handset-subtitle mb-0">
            Access predefined operational, financial, and compliance reports.
          </p>
        </div>
      </div>
      <div className="reports-unified-tables">
        {renderContent()}
      </div>
    </Box>
  );
};

export default AdminReports;
