import { Box, Button, Typography, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useSelector, useDispatch } from "react-redux";

const DashboardTableChange = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [handsetData, setHandsetData] = useState([]);
  const [airtimeData, setAirtimeData] = useState([]);
  const [showAirtime, setShowAirtime] = useState(true); // State to toggle data display
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAirtimeData = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/${currentUser.EmployeeCode}`);
        setAirtimeData(response.airtimeData || []); // Safeguard for undefined data
      } catch (error) {
        console.error(error);
      }
    };

    const fetchHandsetData = async () => {
      try {
        const response = await axiosInstance.get(`/handsets/${currentUser.EmployeeCode}`);
        setHandsetData(response.handsetData || []); // Safeguard for undefined data
      } catch (error) {
        console.error(error);
      }
    };

    fetchAirtimeData();
    fetchHandsetData();
  }, [dispatch, currentUser.EmployeeCode]);

  const airtimeColumns = [
    { field: "id", headerName: "#", width: 90 },
    { field: "PackageName", headerName: "Package Name", width: 180 },
    { field: "MonthlyPayment", headerName: "Package Price", width: 180 },
    { field: "DeviceName", headerName: "Equipment Name", width: 180 },
    { field: "DevicePrice", headerName: "Equipment Price", width: 180 },
  ];

  const airtimeRows = (airtimeData || []).map((airtime, index) => ({
    id: index + 1,
    PackageName: airtime.PackageName,
    MonthlyPayment: "N$ " + airtime.MonthlyPayment,
    DeviceName: airtime.DeviceName,
    DevicePrice: "N$ " + airtime.DevicePrice,
  }));

  const handsetColumns = airtimeColumns; // Reusing since columns are the same
  const handsetRows = (handsetData || []).map((handset, index) => ({
    id: index + 1,
    PackageName: handset.PackageName,
    MonthlyPayment: "N$ " + handset.MonthlyPayment,
    DeviceName: handset.DeviceName,
    DevicePrice: "N$ " + handset.DevicePrice,
  }));

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowAirtime(!showAirtime)} // Toggle data display
        style={{ marginBottom: "20px" }}
      >
        {showAirtime ? "Show Handset Benefits" : "Show Airtime Benefits"}
      </Button>

      <Typography variant="h3" color={colors.grey[100]}>
        {showAirtime ? "Airtime Benefits" : "Handset Benefits"}
      </Typography>

      <div className="col-11 col-lg-8 ml-1 d-flex flex-column">
        <div className="m-1 m-sm-3">
          <Box
            m="40px 0 0 0"
            height="100%"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .name-column--cell": { color: colors.greenAccent[300] },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.grey[900],
                borderBottom: "none",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.grey[900],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                color: `${colors.grey[100]} !important`,
              },
            }}
          >
            <DataGrid
              rows={showAirtime ? airtimeRows : handsetRows}
              columns={showAirtime ? airtimeColumns : handsetColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableSelectionOnClick
            />
          </Box>
        </div>
      </div>

      <div
        className="col-11 col-lg-3 rounded-3 align-self-start shadow d-flex flex-column p-4 b-g mt-5 me-5"
        style={{ backgroundColor: "#F4F6F7" }}
      >
        <div className="position-relative">
          <div className="row justify-content-between">
            <div
              className="col-md-3 col-lg-5 rounded-3 shadow p-4 align-items-center"
              style={{ backgroundColor: "#0096D6", color: "white" }}
            >
              <Typography>
                {showAirtime ? "Qualifying Airtime Allowance" : "Handset Qualifying Allowance"}
              </Typography>
              <p className="mt-1 text-center">
                N$ {showAirtime ? airtimeData[0]?.AirtimeAllocation : handsetData[0]?.HandsetAllocation || 0}
              </p>
            </div>
            <div
              className="col-md-3 col-lg-5 rounded-3 shadow p-4 align-items-center"
              style={{ backgroundColor: "#0096D6", color: "white" }}
            >
              <Typography>SUL Balance</Typography>
              <p className="mt-1 text-center">
                N$ {(
                  (showAirtime ? airtimeData[0]?.AirtimeAllocation - airtimeData[0]?.MonthlyPayment
                  : handsetData[0]?.HandsetAllocation - handsetData[0]?.MonthlyPayment) || 0).toFixed(2)}
              </p>
            </div>
            <div
              className="col-md-3 col-lg-5 rounded-3 shadow p-4 align-items-center mt-4"
              style={{ backgroundColor: "#0096D6", color: "white" }}
            >
              <Typography>Available Wallet</Typography>
              <p className="mt-1 text-center">
                N$ {(
                  0.7 *
                  ((showAirtime
                    ? airtimeData[0]?.AirtimeAllocation - airtimeData[0]?.MonthlyPayment
                    : handsetData[0]?.HandsetAllocation - handsetData[0]?.MonthlyPayment) || 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default DashboardTableChange;
