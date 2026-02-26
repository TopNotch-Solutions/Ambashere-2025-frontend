import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const LimitViolationsReport = () => {
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
      setError("Failed to fetch limit violations data");
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

  const limitViolationsColumns = [
    { field: "LimitCheck", headerName: "Limit Check Status", width: 200 },
    { field: "count", headerName: "Count", width: 150, type: "number" },
    { field: "percentage", headerName: "Percentage", width: 150, type: "number" },
  ];

  const subscriptionStatusColumns = [
    { field: "SubscriptionStatus", headerName: "Subscription Status", width: 200 },
    { field: "count", headerName: "Count", width: 150, type: "number" },
    { field: "percentage", headerName: "Percentage", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Limit Violations Report
      </Typography>

      {/* Limit Check Violations */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Limit Check Violations
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.limitViolations}
            columns={limitViolationsColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.LimitCheck || Math.random()}
          />
        </Box>
      </Box>

      {/* Subscription Status */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Subscription Status Overview
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.subscriptionStatus}
            columns={subscriptionStatusColumns}
            pageSize={5}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.SubscriptionStatus || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LimitViolationsReport;
