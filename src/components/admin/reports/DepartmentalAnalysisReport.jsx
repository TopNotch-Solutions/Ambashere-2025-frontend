import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import axiosInstance from "../../../utils/axiosInstance";

const DepartmentalAnalysisReport = () => {
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
      // Using benefit utilization data as it has department breakdown
      const response = await axiosInstance.get("/reports/analytics/benefit-utilization");
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch departmental analysis data");
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

  const departmentColumns = [
    { field: "Department", headerName: "Department", width: 200 },
    { field: "totalEmployees", headerName: "Total Employees", width: 150, type: "number" },
    { field: "employeesWithBenefits", headerName: "Employees with Benefits", width: 200, type: "number" },
    { field: "utilizationPercentage", headerName: "Utilization %", width: 150, type: "number" },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 3 }}>
        Departmental Analysis Report
      </Typography>

      {/* Overall Utilization */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Overall Utilization Summary
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
              {data.overall?.totalEmployees || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Employees with Benefits
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.overall?.employeesWithBenefits || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color={colors.grey[100]}>
              Utilization Rate
            </Typography>
            <Typography variant="h5" color={colors.greenAccent[300]}>
              {data.overall?.utilizationPercentage || 0}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Department Breakdown */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Department Utilization Breakdown
        </Typography>
        <Box height={400} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.byDepartment}
            columns={departmentColumns}
            pageSize={10}
            disableSelectionOnClick
            hideFooter
            getRowId={(row) => row.Department || Math.random()}
          />
        </Box>
      </Box>

      {/* Peak Usage Periods */}
      <Box mb={4}>
        <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 2 }}>
          Peak Usage Periods (Last 12 Months)
        </Typography>
        <Box height={300} sx={{ "& .MuiDataGrid-root": { border: "none" } }}>
          <DataGrid
            rows={data.peakPeriods}
            columns={[
              { field: "month", headerName: "Month", width: 150 },
              { field: "newAllocations", headerName: "New Allocations", width: 200, type: "number" },
            ]}
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

export default DepartmentalAnalysisReport;
