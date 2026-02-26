import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const TrendAnalysisReport = () => {
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
      const response = await axiosInstance.get("/reports/analytics/trends");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch trend analysis data");
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

  const monthlyTrendsColumns = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "newContracts", headerName: "New Contracts", width: 150, type: "number" },
    { field: "monthlyRevenue", headerName: "Monthly Revenue", width: 150, type: "number" },
    { field: "avgMonthlyPayment", headerName: "Avg Monthly Payment", width: 200, type: "number" },
  ];

  const yearlyComparisonColumns = [
    { field: "year", headerName: "Year", width: 100 },
    { field: "totalContracts", headerName: "Total Contracts", width: 150, type: "number" },
    { field: "totalRevenue", headerName: "Total Revenue", width: 150, type: "number" },
    { field: "avgMonthlyPayment", headerName: "Avg Monthly Payment", width: 200, type: "number" },
  ];

  const seasonalPatternsColumns = [
    { field: "month", headerName: "Month", width: 100 },
    { field: "monthName", headerName: "Month Name", width: 150 },
    { field: "contractCount", headerName: "Contract Count", width: 150, type: "number" },
    { field: "avgPayment", headerName: "Avg Payment", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Trend Analysis Report
      </Typography>

      {/* Monthly Trends */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Monthly Trends (Last 12 Months)
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.monthlyTrends}
            columns={monthlyTrendsColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.month || Math.random()}
          />
        </Box>
      </Box>

      {/* Yearly Comparison */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Yearly Comparison
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.yearlyComparison}
            columns={yearlyComparisonColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.year || Math.random()}
          />
        </Box>
      </Box>

      {/* Seasonal Patterns */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Seasonal Patterns (Last 2 Years)
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.seasonalPatterns}
            columns={seasonalPatternsColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.month || Math.random()}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TrendAnalysisReport;
