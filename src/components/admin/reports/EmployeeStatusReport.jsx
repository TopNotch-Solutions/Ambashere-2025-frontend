import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const EmployeeStatusReport = () => {
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
      const response = await axiosInstance.get("/reports/employee/status");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch employee status data");
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

  const statusColumns = [
    { field: "EmploymentStatus", headerName: "Status", width: 200 },
    { field: "count", headerName: "Count", width: 150, type: "number" },
    { field: "percentage", headerName: "Percentage", width: 150, type: "number" },
  ];

  const newHiresColumns = [
    { field: "month", headerName: "Month", width: 200 },
    { field: "newHires", headerName: "New Hires", width: 150, type: "number" },
  ];

  const categoryColumns = [
    { field: "category", headerName: "Category", width: 200 },
    { field: "count", headerName: "Count", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Employee Status Report
      </Typography>

      {/* Status Breakdown */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Employment Status Breakdown
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.statusBreakdown}
            columns={statusColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.EmploymentStatus || Math.random()}
          />
        </Box>
      </Box>

      {/* New Hires by Month */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          New Hires by Month (Last 12 Months)
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.newHiresByMonth}
            columns={newHiresColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.month || Math.random()}
          />
        </Box>
      </Box>

      {/* Temporary vs Permanent */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Temporary vs Permanent Employees
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.temporaryVsPermanent}
            columns={categoryColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.category || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeStatusReport;
