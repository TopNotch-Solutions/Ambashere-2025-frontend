import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const CostPerEmployeeReport = () => {
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
      // Using cost analysis data as it has cost per employee information
      const response = await axiosInstance.get("/reports/financial/cost-analysis");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch cost per employee data");
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

  const costByDepartmentColumns = [
    { field: "Department", headerName: "Department", width: 200 },
    { field: "totalCost", headerName: "Total Cost", width: 150, type: "number" },
    { field: "contractCount", headerName: "Contract Count", width: 150, type: "number" },
    { field: "avgCostPerContract", headerName: "Avg Cost/Contract", width: 200, type: "number" },
  ];

  const monthlyCostsColumns = [
    { field: "month", headerName: "Month", width: 150 },
    { field: "totalMonthlyCost", headerName: "Total Monthly Cost", width: 200, type: "number" },
    { field: "activeContracts", headerName: "Active Contracts", width: 150, type: "number" },
    { field: "avgMonthlyPayment", headerName: "Avg Monthly Payment", width: 200, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Cost Per Employee Report
      </Typography>

      {/* Device and Upfront Costs Summary */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Investment Summary
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
              Total Device Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.deviceCosts?.totalDeviceCost?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Avg Device Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.deviceCosts?.avgDeviceCost?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Devices Allocated
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.deviceCosts?.devicesAllocated || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Upfront Payments
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.upfrontPayments?.totalUpfrontPayments?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Avg Upfront Payment
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.upfrontPayments?.avgUpfrontPayment?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Upfront Payment Count
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.upfrontPayments?.upfrontPaymentCount || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Cost by Department */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Cost by Department
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.costByDepartment}
            columns={costByDepartmentColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.Department || Math.random()}
          />
        </Box>
      </Box>

      {/* Monthly Cost Trends */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Monthly Cost Trends (Last 12 Months)
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.monthlyCosts}
            columns={monthlyCostsColumns}
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

export default CostPerEmployeeReport;
