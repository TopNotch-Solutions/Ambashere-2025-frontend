import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";
import { DataGrid } from "@mui/x-data-grid";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { useSelector, useDispatch } from "react-redux";
import formatDate from "../../../components/global/dateFormatter";

const HandsetBenefits = () => {
  const { employeeCode } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/handsets/handset/${employeeCode}`);
        const handsetData = Array.isArray(response.data) ? response.data : [];
        console.log(handsetData)
        setData(handsetData);
      } catch (error) {
        // console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 130 },
    { field: "FixedAssetCode", headerName: "Fixed Asset Code", width: 150 },
    { field: "HandsetName", headerName: "Handset Name", width: 180 },
    { field: "DevicePrice", headerName: "Handset Price", width: 140 },
    { field: "ExccessPrice", headerName: "Exccess Price", width: 140 },
    { field: "RequestDate", headerName: "Requested Date", width: 180 },
    { field: "AllocationDate", headerName: "Collected Date", width: 180 },
    { field: "NewAllocationDate", headerName: "New Renewal Date", width: 180 },
    { field: "Status", headerName: "Status", width: 100 ,},
  ];

  const rows = data?.map((handset, index) => ({
   id: handset.id,
       EmployeeCode: handset.EmployeeCode,
       HandsetName: handset.HandsetName,
       DevicePrice: handset.HandsetPrice,
       ExccessPrice: handset.AccessFeePaid,
       // StaffPrice: "N$ " + handset.StaffPrice || "N$" + 0,
       // UpfrontPayment: "N$ " + handset.UpfrontPayment,
       FixedAssetCode: handset.FixedAssetCode,
       RequestDate: formatDate(handset.RequestDate),
       AllocationDate: formatDate(handset.CollectionDate),
       NewAllocationDate: formatDate(handset.RenewalDate),
       Status: handset.status,
  }));

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row m-auto">
        {/* Learn More */}
        {data.length > 0 ? (
           <Box>
           <div
             className="col-12 col-md-11 col-lg-9 rounded-3 d-flex justify-content-around flex-column p-4 b-g mx-auto"
             style={{ backgroundColor: "#F5F5F5" }}
           >
             <div className="position-relative">
               <div className="d-flex row">
                 <div className="col-sm-4 rounded-4 border-end border-light-subtle p-2">
                   <div className="row g-5">
                     <div className="col-md-7">
                        <p>Active Handset</p>
                        <p>{data[0]?.HandsetName}</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <PhoneIphoneIcon fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 rounded-4 border-end border-light-subtle p-2">
                    <div className="row g-5">
                      <div className="col-md-7">
                        <p>Handset Price</p>
                        <p>N$ {data[0]?.HandsetPrice}</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <FaMoneyBillTrendUp fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 rounded-4  p-2">
                    <div className="row g-5">
                      <div className="col-md-7">
                        <p>New Handset Due:</p>
                        <p>{formatDate(data[0]?.RenewalDate)}</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <CalendarMonthIcon fontSize="large" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        ) : (
          <div className="text-danger text-center my-4 fw-bold">
  No handset information is currently available for this user.
</div>

        )}

        <div className="row mt-4">
          {/* CONTACT INFO  */}
          {data.length > 0 ? (
            <div className="col-12 col-lg-4 border rounded-3 d-flex flex-column p-3 b-g">
              <div className="position-relative">
                <div className="row">
                  <div className="d-flex row text-center">
                    <h5>CONTACT INFORMATION</h5>
                    <div className="border-bottom"></div>
                    <div className="col mt-2 text-start">
                      <p>Benefit Amount</p>
                      <p>Benefit Category</p>
                      <p>Benefit Start Date</p>
                      <p>Handset Name</p>
                    </div>
                    <div className="col mt-2 text-start">
                      {" "}
                      <p>N$ {data[0]?.HandsetPrice}</p>
                      <p>Handset Benefit</p>
                      <p>{formatDate(data[0]?.CollectionDate)}</p>
                      <p>{data[0]?.HandsetName}</p>
                    </div>
                  </div>
                  <div className="col"></div>
                </div>
              </div>
            </div>
          ) : (
            <div></div>
          )}

          {/* Plan Table */}
          {data.length > 0 ? (
            <div className="col-12 col-lg-8 ml-1 d-flex flex-column">
              <div className="m-1 m-sm-3">
                <Box
                  width="100%"
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
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandsetBenefits;
