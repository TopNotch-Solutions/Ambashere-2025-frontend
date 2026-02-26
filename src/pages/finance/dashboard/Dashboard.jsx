import React, { useMemo, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import LineChart from "../../../components/admin/charts/LineChart";
import { useSelector } from "react-redux";
import RoleSwitcher from "../../../components/admin/RoleSwitcher";

const FinanceDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useSelector((state) => state.auth.user);

  const rows = useMemo(
    () => [
      { id: 101, RequestNumber: "HR-0101", Employee: "EMP101", Action: "Payment Confirmed", By: "FIN_PAY_01", Date: "2025-10-01", Notes: "Excess N$ 750" },
      { id: 102, RequestNumber: "HR-0102", Employee: "EMP240", Action: "Asset Code Assigned", By: "FIN_AP_02", Date: "2025-10-02", Notes: "FA-55678" },
      { id: 103, RequestNumber: "HR-0103", Employee: "EMP999", Action: "Rejected", By: "FIN_AP_02", Date: "2025-10-03", Notes: "Exceeded policy" },
    ],
    []
  );

  const metrics = useMemo(() => {
    const total = rows.length;
    const paymentsConfirmed = rows.filter(r => r.Action === "Payment Confirmed").length;
    const assetsAssigned = rows.filter(r => r.Action === "Asset Code Assigned").length;
    const rejected = rows.filter(r => r.Action === "Rejected").length;
    return { total, paymentsConfirmed, assetsAssigned, rejected };
  }, [rows]);

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "Employee", headerName: "Employee", width: 120 },
    { field: "Action", headerName: "Action", width: 180 },
    { field: "By", headerName: "By", width: 140 },
    { field: "Date", headerName: "Date", width: 140 },
    { field: "Notes", headerName: "Notes", width: 220 },
  ];

  return (
    <Box m="20px">
        {currentUser.RoleID === 9 && <RoleSwitcher title="User"/>}
        <div className="mb-2 mb-md-3"></div>
      <Box display="grid" gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"} gridAutoRows="140px" gap="20px">
        {/* Summary Metrics */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Total Finance Actions</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.total}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Last 30 days</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Payments Confirmed</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.paymentsConfirmed}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Approvals</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Asset Codes Assigned</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.assetsAssigned}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Fixed Assets</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Rejected</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.rejected}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Needs Attention</Typography>
          </Box>
        </Box>

        {/* Charts Row */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 12"} gridRow="span 3">
          <Box height="310px" m="-20px 0 0 0">
            <LineChart />
          </Box>
        </Box>
        {/* Removed Employment Status and Service Plan charts for Finance */}

        {/* Recent Activity Table */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 12"} gridRow="span 3">
          <Box height="100%"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.grey[900], borderBottom: "none" },
              "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
              "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.grey[900] },
            }}>
            <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} />
          </Box>
        </Box>

        {/* Composition Chart removed for Finance */}
      </Box>
    </Box>
  );
};

export default FinanceDashboard;


