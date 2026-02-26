import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert, TextField, Button } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const MonthlyFinancialSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reports/time/monthly?month=${selectedMonth}&year=${selectedYear}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch monthly financial data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
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

  const departmentColumns = [
    { field: "Department", headerName: "Department", width: 200 },
    { field: "contractCount", headerName: "Contract Count", width: 150, type: "number" },
    { field: "departmentCost", headerName: "Department Cost", width: 200, type: "number" },
    { field: "avgCostPerContract", headerName: "Avg Cost/Contract", width: 200, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Monthly Financial Summary
      </Typography>

      {/* Month/Year Selection */}
      <Box mb={4} display="flex" gap={2} alignItems="center">
        <TextField
          select
          label="Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </TextField>
        <TextField
          type="number"
          label="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          sx={{ minWidth: 120 }}
        />
        <Button variant="contained" onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Summary for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: colors.primary[400], 
            borderRadius: 2,
            display: "flex",
            gap: 4,
            flexWrap: "wrap"
          }}
        >
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Active Beneficiaries
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.summary?.activeBeneficiaries || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Contracts
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.summary?.totalContracts || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Monthly Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.summary?.totalMonthlyCost?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Avg Monthly Payment
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.summary?.avgMonthlyPayment?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Device Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.summary?.totalDeviceCost?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Device Allocations
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.summary?.deviceAllocations || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Department Breakdown */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Department Breakdown
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.departmentBreakdown}
            columns={departmentColumns}
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

export default MonthlyFinancialSummary;
