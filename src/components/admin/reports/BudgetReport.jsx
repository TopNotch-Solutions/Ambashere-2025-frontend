import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const BudgetReport = () => {
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
      const response = await axiosInstance.get("/reports/financial/budget");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch budget data");
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
    { field: "month", headerName: "Month", width: 200 },
    { field: "monthlySpending", headerName: "Monthly Spending", width: 200, type: "number" },
    { field: "newContracts", headerName: "New Contracts", width: 200, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Budget Report
      </Typography>

      {/* Current Month Summary */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Current Month Summary
        </Typography>
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: colors.primary[400], 
            borderRadius: 2,
            display: "flex",
            gap: 4
          }}
        >
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Spending
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.currentMonth?.totalSpending?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Active Contracts
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.currentMonth?.activeContracts || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Monthly Trends */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Monthly Spending Trends (Last 6 Months)
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
    </Box>
  );
};

export default BudgetReport;
