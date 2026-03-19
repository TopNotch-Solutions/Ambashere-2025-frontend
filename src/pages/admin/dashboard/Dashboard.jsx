import React, { useEffect, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { tokens } from "../../../theme";
import InfoBox from "../../../components/admin/charts/InfoBox";
import LineChart from "../../../components/admin/charts/LineChart";
import PieChart from "../../../components/admin/charts/PieChart";
import DoughnutChart from "../../../components/admin/charts/DoughnutChart";
import Table from "../../../components/admin/charts/Table";
import HorizontalStackChart from "../../../components/admin/charts/HorizontalStackChart";
import { useSelector } from "react-redux";
import RoleSwitcher from "../../../components/admin/RoleSwitcher";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/adminDashboard.css";

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentUser = useSelector((state) => state.auth.user);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isXlScreen = useMediaQuery(theme.breakpoints.down("xl"));

  return (
    <Box m="20px" className="handset-simulator-page admin-dashboard-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Admin Dashboard</h2>
          <p className="handset-subtitle mb-0">
            Monitor staff, allocations, and service usage from one overview.
          </p>
        </div>
      </div>
      <Box className="" justifyContent={"space-evenly"}>
        {currentUser.RoleID === 1 && <RoleSwitcher title="User" />}
        <Box
          className="admin-dashboard-grid"
          display="grid"
          gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
          gridAutoRows="140px"
          gap="20px"
        >
          {/* ROW 1: EMPLOYEE COUNT */}
          <Box
            className="shadow admin-dashboard-card"
            marginTop={"20px"}
            gridColumn={isSmallScreen ? "span 12" : "span 3"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox title="Permanent Employees" endpoint="/staffmember/permanentEmployees" subtitle="Employee" />
          </Box>
          <Box
            className="shadow admin-dashboard-card"
            marginTop={"20px"}
            gridColumn={isSmallScreen ? "span 12" : "span 3"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox title="Temporary Employees" endpoint="/staffmember/temporaryEmployees" subtitle="Employee" />
          </Box>
          <Box
            className="shadow admin-dashboard-card"
            marginTop={"20px"}
            gridColumn={isSmallScreen ? "span 12" : "span 3"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox title="Active Employees" endpoint="/staffmember/activeEmployees" subtitle="Employee" />
          </Box>
          <Box
            className="shadow admin-dashboard-card"
            marginTop={"20px"}
            gridColumn={isSmallScreen ? "span 12" : "span 3"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InfoBox title="Inactive Employees" endpoint="/staffmember/inactiveEmployees" subtitle="Employee" />
          </Box>

          {/* ROW 2: LINE GRAPHS AND PIE CHART */}
          <Box
            className="shadow admin-dashboard-card"
            gridColumn={isXlScreen ? "span 12" : "span 9"}
            gridRow="span 3"
           
          >
            <Box height="310px" m="-20px 0 0 0">
              <LineChart />
            </Box>
          </Box>

          {/* TOTAL EMPLOYEE */}
          <Box
            className="shadow admin-dashboard-card"
            gridColumn={isXlScreen ? "span 6" : "span 3"}
            gridRow="span 2"
            overflow="auto"
          >
            <Box height="250px" m="-20px 0 0 0">
              <HorizontalStackChart />
            </Box>
          </Box>

          {/* SERVICE PLAN */}
          <Box
            className="shadow admin-dashboard-card"
            gridColumn={isXlScreen ? "span 6" : "span 3"}
            gridRow="span 2"
            overflow="auto"
          >
            <Box height="250px" m="-20px 0 0 0">
              <DoughnutChart />
            </Box>
          </Box>

          {/* ROW 3: HANDSET ALLOCATION TABLE */}
          <Box
            className="shadow admin-dashboard-card"
            gridColumn={isXlScreen ? "span 12" : "span 9"}
            gridRow="span 3"
          >
            <Box height="250px">
              <Table />
            </Box>
          </Box>

          {/* GENDER COMPOSITION */}
          <Box
            className="shadow admin-dashboard-card"
            gridColumn={isXlScreen ? "span 12" : "span 3"}
            gridRow="span 2"
            mt={isXlScreen ? "30px" : "0px"}
            overflow="auto"
          >
            <Box height="250px" >
              <PieChart />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
