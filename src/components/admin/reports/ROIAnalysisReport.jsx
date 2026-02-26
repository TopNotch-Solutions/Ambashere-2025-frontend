import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";

const ROIAnalysisReport = () => {
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
      const response = await axiosInstance.get("/reports/roi/overview");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch ROI analysis data");
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

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        ROI Analysis Report
      </Typography>

      {/* Total Investment */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Total Investment Summary
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
              Total Monthly Investment
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.totalInvestment?.totalMonthlyInvestment?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Device Investment
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.totalInvestment?.totalDeviceInvestment?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Upfront Investment
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.totalInvestment?.totalUpfrontInvestment?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Contracts
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.totalInvestment?.totalContracts || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Cost Per Employee */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Cost Per Employee Analysis
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
              Total Employees
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.costPerEmployee?.totalEmployees || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Total Monthly Cost
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.costPerEmployee?.totalMonthlyCost?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Cost Per Employee
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              ${data.costPerEmployee?.costPerEmployee?.toLocaleString() || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Utilization ROI */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Utilization ROI Analysis
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
              Total Eligible Employees
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.utilizationROI?.totalEligibleEmployees || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Employees Using Benefits
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.utilizationROI?.employeesUsingBenefits || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Utilization Rate
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.utilizationROI?.utilizationRate || 0}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ROIAnalysisReport;
