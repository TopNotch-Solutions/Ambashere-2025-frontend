import React, { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useSelector, useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import axiosInstance from "../../../utils/axiosInstance";

const UserAirtime = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contractData, setContractData] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/staffContracts/${currentUser.EmployeeCode}`);
        return response.data.contractData || [];
      } catch (error) {
        // console.log(error);
        throw error;
      }
    };
  
    Promise.all(fetchContractData())
      .then(( contractData) => {
        setContractData(contractData);
      })
      .catch((err) => console.log(err));
  }, []);
  

  // console.log(contractData)

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "DeviceName", headerName: "Device Name", width: 220 },
    { field: "PackageName", headerName: "Package Name", width: 220 },
    { field: "DeviceMonthlyPrice", headerName: "Device Price", width: 180 },
    // { field: "UpfrontPayment", headerName: "Top Up Amount", width: 130 },
  ];

  const rows = contractData.map((contract, index) => ({
    id: index + 1,
    DeviceName: contract.DeviceName,
    PackageName: contract.PackageName,
    // FixedAssetCode: contract.FixedAssetCode,
    DeviceMonthlyPrice: "N$ " + contract.DeviceMonthlyPrice,
  }));

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <h2>My Airtime</h2>
          <p>
            Track your airtime benefits, view your current balance and monthly
            allocations.
          </p>
        </div>

        {/* Airtime Stats */}
        {contractData.length > 0 ? (
          <Box>
            <div
              className="col-11 col-lg-9 rounded-3 d-flex justify-content-around flex-column p-4 b-g mx-auto"
              style={{ backgroundColor: "#F5F5F5" }}
            >
              <div className="position-relative">
                <div className="d-flex row">
                  <div className="col-sm-4 rounded-4 border-end border-light-subtle p-2">
                    <div className="row g-5">
                      <div className="col-md-7">
                        <p>N$ {contractData[0].AirtimeAllocation}</p>
                        <p>Qualiying Allowance</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <VerifiedIcon fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 rounded-4 border-end border-light-subtle p-2">
                    <div className="row g-5">
                      <div className="col-md-7">
                        <p>
                          N${" "}
                          {contractData[0].AirtimeAllocation - contractData[0].MonthlyPayment}
                        </p>
                        <p>Available Allowance</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <EventAvailableIcon fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 rounded-4  p-2">
                    <div className="row g-5">
                      <div className="col-md-7">
                        <p>
                          N${" "}
                          {contractData[0].AirtimeAllocation - contractData[0].MonthlyPayment}
                        </p>
                        <p>New Allowance</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <FiberNewIcon fontSize="large" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        ) : (
          <h3 className="text-center mt-5 text-danger">No information to show yet</h3>
        )}

        {/* Plan Table */}
        <div className="col-11 col-lg-12 ml-1 d-flex flex-column">
          <div className="m-1 m-sm-3">
            <Box
              m="40px 0 0 0"
              height="100%"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
                "& .name-column--cell": {
                  color: colors.greenAccent[300],
                },
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
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                // onRowClick={handleRowClick}
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAirtime;
