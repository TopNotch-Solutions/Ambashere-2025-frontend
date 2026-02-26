import React, { useMemo } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import LineChart from "../../../components/admin/charts/LineChart";
import { useSelector } from "react-redux";
import RoleSwitcher from "../../../components/admin/RoleSwitcher";

const RetailDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useSelector((state) => state.auth.user);

  const rows = useMemo(
    () => [
      { id: 1, RequestNumber: "HR-0601", Employee: "EMP700", Device: "iPhone 13", Action: "Reserved" },
      { id: 2, RequestNumber: "HR-0602", Employee: "EMP723", Device: "Samsung S22", Action: "Collected" },
      { id: 3, RequestNumber: "HR-0603", Employee: "EMP740", Device: "Pixel 7", Action: "Proof Uploaded" },
    ],
    []
  );

  const metrics = useMemo(() => {
    const total = rows.length;
    const reserved = rows.filter(r => r.Action === "Reserved").length;
    const collected = rows.filter(r => r.Action === "Collected").length;
    const proofs = rows.filter(r => r.Action === "Proof Uploaded").length;
    return { total, reserved, collected, proofs };
  }, [rows]);

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "Employee", headerName: "Employee", width: 120 },
    { field: "Device", headerName: "Device", width: 160 },
    { field: "Action", headerName: "Action", width: 200 },
  ];

  return (
    <Box m="20px">
      {currentUser.RoleID === 11 && <RoleSwitcher title="User"/>}
      <div className="mb-2 mb-md-3"></div>
      <Box display="grid" gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"} gridAutoRows="140px" gap="20px">
        {/* Summary */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Total Retail Actions</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.total}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Last 30 days</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Reserved</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.reserved}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Awaiting pickup</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Collected</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.collected}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Completed</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Proofs Uploaded</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.proofs}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Documentation</Typography>
          </Box>
        </Box>

        {/* Line Chart */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 12"} gridRow="span 3">
          <Box height="310px" m="-20px 0 0 0">
            <LineChart />
          </Box>
        </Box>

        {/* Recent Activity */}
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
      </Box>
    </Box>
  );
};

export default RetailDashboard;


