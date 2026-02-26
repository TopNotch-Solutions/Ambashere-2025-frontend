import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const DeviceDistributionAnalysis = () => {
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
      const response = await axiosInstance.get("/reports/devices/allocation");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch device distribution data");
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

  const deviceDistributionColumns = [
    { field: "DeviceName", headerName: "Device Name", width: 250 },
    { field: "allocationCount", headerName: "Allocation Count", width: 150, type: "number" },
    { field: "totalValue", headerName: "Total Value", width: 150, type: "number" },
    { field: "avgPrice", headerName: "Avg Price", width: 150, type: "number" },
  ];

  const allocationTrendsColumns = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "deviceAllocations", headerName: "Device Allocations", width: 200, type: "number" },
    { field: "totalContracts", headerName: "Total Contracts", width: 150, type: "number" },
  ];

  const departmentUsageColumns = [
    { field: "Department", headerName: "Department", width: 200 },
    { field: "deviceCount", headerName: "Device Count", width: 150, type: "number" },
    { field: "totalContracts", headerName: "Total Contracts", width: 150, type: "number" },
    { field: "deviceUsagePercentage", headerName: "Device Usage %", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Device Distribution Analysis
      </Typography>

      {/* Device Distribution */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Device Distribution by Model
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.deviceDistribution}
            columns={deviceDistributionColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.DeviceName || Math.random()}
          />
        </Box>
      </Box>

      {/* Allocation Trends */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Device Allocation Trends (Last 12 Months)
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.allocationTrends}
            columns={allocationTrendsColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.month || Math.random()}
          />
        </Box>
      </Box>

      {/* Department Device Usage */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Device Usage by Department
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.departmentDeviceUsage}
            columns={departmentUsageColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.Department || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DeviceDistributionAnalysis;
