import { Box, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import { useNavigate } from "react-router-dom";
import ViewReports from "../../../components/admin/reports/ViewReports";
import ViewButton from "../../../components/admin/reports/ViewButton";

const AdminReports = () => {
  const navigate = useNavigate();
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
        <Box m="20px" width={"auto"}>
          <div
            style={{
              display: "flex",
            }}
          >
            <Box
              m="20px 0 0 0"
              height=""
              textAlign={"center"}
              justifyContent={"center"}
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
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                disableSelectionOnClick
                // checkboxSelection
                onRowClick={(params, event) => {
                  // console.log("Row clicked params:", params);
                  handleRowClick(params.row);
                }}
                hideFooter
              />
            </Box>
          </div>
        </Box>
      );
    }
  };

  return (
    <Box m="20px" sx={{ width: "auto" }}>
      {renderContent()}
    </Box>
  );
};

export default AdminReports;
