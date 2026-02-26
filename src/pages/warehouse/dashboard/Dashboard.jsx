import React, { useMemo } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import LineChart from "../../../components/admin/charts/LineChart";
import { useSelector } from "react-redux";
import RoleSwitcher from "../../../components/admin/RoleSwitcher";

const WarehouseDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useSelector((state) => state.auth.user);

  const rows = useMemo(
    () => [
      { id: 1, RequestNumber: "HR-0201", Employee: "EMP500", Action: "Ready for Collection", Device: "iPhone 13" },
      { id: 2, RequestNumber: "HR-0202", Employee: "EMP422", Action: "Device Retrieved", Device: "Samsung S22" },
      { id: 3, RequestNumber: "HR-0203", Employee: "EMP210", Action: "MR Closed", Device: "Pixel 7" },
    ],
    []
  );

  const metrics = useMemo(() => {
    const total = rows.length;
    const ready = rows.filter(r => r.Action === "Ready for Collection").length;
    const retrieved = rows.filter(r => r.Action === "Device Retrieved").length;
    const closed = rows.filter(r => r.Action === "MR Closed").length;
    return { total, ready, retrieved, closed };
  }, [rows]);

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "Employee", headerName: "Employee", width: 120 },
    { field: "Device", headerName: "Device", width: 160 },
    { field: "Action", headerName: "Action", width: 200 },
  ];

  return (
    <Box m="20px">
      {currentUser.RoleID === 10 && <RoleSwitcher title="User"/>}
      <div className="mb-2 mb-md-3"></div>
      <Box display="grid" gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"} gridAutoRows="140px" gap="20px">
        {/* Summary Metrics */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Total Warehouse Actions</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.total}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Last 30 days</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Ready for Collection</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.ready}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Awaiting pickup</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>Devices Retrieved</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.retrieved}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>In process</Typography>
          </Box>
        </Box>
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 3"} display="flex" alignItems="center" justifyContent="center">
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: colors.grey[100] }}>MR Closed</Typography>
            <Typography variant="h3" sx={{ color: colors.blueAccent[500] }}>{metrics.closed}</Typography>
            <Typography variant="body2" sx={{ color: colors.grey[600] }}>Completed</Typography>
          </Box>
        </Box>

        {/* Line Chart */}
        <Box className="shadow" gridColumn={isSmallScreen ? "span 12" : "span 12"} gridRow="span 3">
          <Box height="310px" m="-20px 0 0 0">
            <LineChart />
          </Box>
        </Box>

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
      </Box>
    </Box>
  );
};

export default WarehouseDashboard;


