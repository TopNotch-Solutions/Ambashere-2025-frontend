import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const PackageUtilizationReport = () => {
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
      const response = await axiosInstance.get("/reports/packages/utilization");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch package utilization data");
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

  const packagePerformanceColumns = [
    { field: "PackageName", headerName: "Package Name", width: 250 },
    { field: "MonthlyPrice", headerName: "Monthly Price", width: 150, type: "number" },
    { field: "PaymentPeriod", headerName: "Payment Period", width: 150 },
    { field: "IsActive", headerName: "Active", width: 100, renderCell: (params) => params.value ? "Yes" : "No" },
    { field: "usageCount", headerName: "Usage Count", width: 150, type: "number" },
    { field: "totalRevenue", headerName: "Total Revenue", width: 150, type: "number" },
    { field: "avgRevenue", headerName: "Avg Revenue", width: 150, type: "number" },
  ];

  const activeVsInactiveColumns = [
    { field: "status", headerName: "Status", width: 150 },
    { field: "packageCount", headerName: "Package Count", width: 150, type: "number" },
    { field: "usageCount", headerName: "Usage Count", width: 150, type: "number" },
  ];

  const monthlyUsageColumns = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "PackageName", headerName: "Package Name", width: 200 },
    { field: "usageCount", headerName: "Usage Count", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Package Utilization Report
      </Typography>

      {/* Package Performance */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Package Performance
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.packagePerformance}
            columns={packagePerformanceColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.PackageName || Math.random()}
          />
        </Box>
      </Box>

      {/* Active vs Inactive */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Active vs Inactive Packages
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.activeVsInactive}
            columns={activeVsInactiveColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.status || Math.random()}
          />
        </Box>
      </Box>

      {/* Monthly Package Usage */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Monthly Package Usage (Last 6 Months)
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.monthlyPackageUsage}
            columns={monthlyUsageColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => `${row.month}-${row.PackageName}` || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PackageUtilizationReport;
