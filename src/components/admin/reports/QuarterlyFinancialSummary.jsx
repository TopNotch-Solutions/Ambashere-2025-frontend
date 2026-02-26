import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert, TextField, Button } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const QuarterlyFinancialSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reports/time/quarterly?quarter=${selectedQuarter}&year=${selectedYear}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch quarterly financial data");
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

  const monthlyBreakdownColumns = [
    { field: "month", headerName: "Month", width: 200 },
    { field: "contractCount", headerName: "Contract Count", width: 150, type: "number" },
    { field: "monthlyCost", headerName: "Monthly Cost", width: 200, type: "number" },
  ];

  const getQuarterName = (quarter) => {
    const quarters = {
      1: "Q1 (Jan-Mar)",
      2: "Q2 (Apr-Jun)", 
      3: "Q3 (Jul-Sep)",
      4: "Q4 (Oct-Dec)"
    };
    return quarters[quarter] || `Q${quarter}`;
  };

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Quarterly Financial Summary
      </Typography>

      {/* Quarter/Year Selection */}
      <Box mb={4} display="flex" gap={2} alignItems="center">
        <TextField
          select
          label="Quarter"
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
          SelectProps={{ native: true }}
          sx={{ minWidth: 120 }}
        >
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>
              Q{q}
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
          Summary for {getQuarterName(selectedQuarter)} {selectedYear}
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
              Total Quarterly Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.summary?.totalQuarterlyCost?.toLocaleString() || 0}
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

      {/* Monthly Breakdown */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Monthly Breakdown
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.monthlyBreakdown}
            columns={monthlyBreakdownColumns}
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

export default QuarterlyFinancialSummary;
