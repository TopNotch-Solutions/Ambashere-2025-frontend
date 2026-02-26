import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const PendingApprovalsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/compliance/overview");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch pending approvals data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const pendingApprovalsColumns = [
    { field: "ContractNumber", headerName: "Contract Number", width: 150 },
    { field: "FullName", headerName: "Employee Name", width: 200 },
    { field: "Department", headerName: "Department", width: 150 },
    { field: "MonthlyPayment", headerName: "Monthly Payment", width: 150, type: "number" },
    { field: "DevicePrice", headerName: "Device Price", width: 150, type: "number" },
    { field: "ContractStartDate", headerName: "Contract Start Date", width: 150 },
    { field: "daysPending", headerName: "Days Pending", width: 150, type: "number" },
  ];

  const approvalStatusColumns = [
    { field: "ApprovalStatus", headerName: "Approval Status", width: 200 },
    { field: "count", headerName: "Count", width: 150, type: "number" },
    { field: "percentage", headerName: "Percentage", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Pending Approvals Report
      </Typography>

      {/* Approval Status Overview */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Approval Status Overview
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.approvalStatus}
            columns={approvalStatusColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.ApprovalStatus || Math.random()}
          />
        </Box>
      </Box>

      {/* Pending Approvals Details */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Pending Approvals Details
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.pendingApprovals}
            columns={pendingApprovalsColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.ContractNumber || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PendingApprovalsReport;
