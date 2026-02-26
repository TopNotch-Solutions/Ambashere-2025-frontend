import React, { useEffect, useState } from "react";
import { Box, Button, Typography, useTheme, CircularProgress, Skeleton } from "@mui/material";
import { tokens } from "../../../theme";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import pic from "../../../assets/Img/Isolation_Mode.png";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import RoleSwitcher from "../../../components/admin/RoleSwitcher";
import UserCalendar from "../calendar/Calendar";
import MiniCalendar from "../../../components/global/calendar/MiniCalendar";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../components/global/dateFormatter";
// import DashboardTableChange from "../../../components/user/DashboardTableChange";

const UserDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [handsetData, setHandsetData] = useState([]);
  const [airtimeData, setAirtimeData] = useState({});
  const [noContract, setNoContract] = useState({});
  const [noHandset, setNoHandset] = useState({});
  const [tempData, setTempData] = useState({});
  const [showAirtime, setShowAirtime] = useState(true);
  const [isLoadingTemp, setIsLoadingTemp] = useState(false);
  const [isLoadingAirtime, setIsLoadingAirtime] = useState(false);
  const [isLoadingHandset, setIsLoadingHandset] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selfHelp = () => {
    navigate("/user/SelfHelp");
  };

  useEffect(() => {
    if (!currentUser || !currentUser.EmployeeCode) return;

    const fetchTemData = async () => {
      try {
        setIsLoadingTemp(true);
        console.log("Temporary user:", currentUser.EmployeeCode);
        const response = await axiosInstance.get(
          `/contracts/Temp/${currentUser.EmployeeCode}`
        );
        console.log(response.data);
        setTempData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingTemp(false);
      }
    };

    const fetchAirtimeData = async () => {
      try {
        setIsLoadingAirtime(true);
        console.log("Permanent user:", currentUser.EmployeeCode);
        const response = await axiosInstance.get(
          `/contracts/${currentUser.EmployeeCode}`
        );
        if (response.data.status === 1) {
          setNoContract(response.data);
        } else {
          setAirtimeData(response.data || {});
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingAirtime(false);
      }
    };

    const fetchHandsetData = async () => {
      try {
        setIsLoadingHandset(true);
        const response = await axiosInstance.get(
          `/handsets/${currentUser.EmployeeCode}`
        );
        console.log("Here are my handsets: ", response.data);
        if (response.data.status === 1) {
          console.log(response.data);
          setNoHandset(response.data || {});
        } else {
          setHandsetData(response.data || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingHandset(false);
      }
    };

    if (currentUser.EmploymentCategory === "Temporary") {
      fetchTemData();
    } else {
      fetchAirtimeData();
      fetchHandsetData();
    }
  }, [currentUser?.EmployeeCode]);

  const airtimeColumns = [
    { field: "id", headerName: "#", width: 90 },
    { field: "PackageName", headerName: "Package Name", width: 180 },
    { field: "MonthlyPayment", headerName: "Package Price", width: 180 },
    { field: "DeviceName", headerName: "Equipment Name", width: 180 },
    { field: "DevicePrice", headerName: "Equipment Price", width: 180 },
  ];

  const airtimeRows = (airtimeData?.contracts || []).map((airtime, index) => ({
    id: index + 1,
    PackageName: airtime.PackageName,
    MonthlyPayment: "N$ " + airtime.MonthlyPayment,
    DeviceName: airtime.DeviceName,
    DevicePrice: "N$ " + airtime.DevicePrice,
  }));

  const handsetColumns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "FixedAssetCode", headerName: "Fixed Asset Code", width: 180 },
    { field: "HandsetName", headerName: "Handset Name", width: 170 },
    { field: "HandsetPrice", headerName: "Price", width: 170 },
    // { field: "StaffPrice", headerName: "Handset Price", width: 130 },
    { field: "AllocationDate", headerName: "Date Issued", width: 180 },
    { field: "NewAllocationDate", headerName: "New Handset Date", width: 180 },
  ];
  console.log("this is the api: ", handsetData?.handsets);
  const handsetRows = (handsetData?.handsets || []).map((handset, index) => ({
    id: index + 1,
    FixedAssetCode: handset?.FixedAssetCode,
    HandsetAllocation: "N$ " + handset?.HandsetAllocation,
    HandsetPrice: "N$ " + handset?.HandsetPrice,
    PackageName: handset?.PackageName,
    HandsetName: handset?.HandsetName,
    AllocationDate: formatDate(handset?.CollectionDate),
    NewAllocationDate: formatDate(handset?.RenewalDate),
    // DevicePrice: "N$ " + handset.DevicePrice,
  }));

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <h2>Welcome Back, {currentUser.FullName}</h2>
          <p>Here’s what’s happening with your account</p>
        </div>

        {currentUser.RoleID === 1 && <RoleSwitcher title="Admin" />}
        {currentUser.RoleID === 9 && <RoleSwitcher title="Finance" />}
        {currentUser.RoleID === 10 && <RoleSwitcher title="Warehouse" />}
        {currentUser.RoleID === 11 && <RoleSwitcher title="Retail" />}
        <div className="mb-2 mb-md-3"></div>

        {/* Learn More */}
        <div className="col-11 col-xl-8 rounded-3 shadow d-flex flex-column p-4 align-items-center mb-3 mb-xl-0">
          <div className="position-relative">
            <div className="row">
              <div className="col-md-8 col-12 position-relative">
                <div>
                  <h5>Optimize Your Benefits – Explore Ambasphere!</h5>
                  <p className="mb-5">
                    Manage your airtime, track your handset benefits, and stay
                    updated with your staff discounts all in one place. Empower
                    yourself with our intuitive and user-friendly platform
                    designed just for you.
                  </p>
                </div>
                <Button
                  onClick={selfHelp}
                  style={{
                    fontSize: "13px",
                    height: "auto",
                    backgroundColor: "#1A69AC",
                    color: "#fff",
                    padding: "8px",
                    paddingLeft: "30px",
                    paddingRight: "30px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    borderColor: "#1A69AC",
                    border: "1px solid",
                    alignItems: "",
                    position: "absolute",
                    bottom: 0,
                  }}
                >
                  Learn More
                  <ArrowForwardIcon size={16} style={{ marginLeft: "10px" }} />
                </Button>
              </div>
              <div className="col d-none d-xxl-block">
                <img rounded-full w-8 h-8 src={pic} alt="user-profile" />
              </div>
            </div>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="col-11 col-xl-3 rounded-3 shadow b-g mt-3 mt-lg-0 me-3">
          <div className="position-relative">
            <MiniCalendar />
          </div>
        </div>

        <div className="position-relative mt-1 p-4">
          <Box style={{ backgroundColor: "#F4F6F7" }}>
            <div className="d-flex flex-row justify-content-between p-4 mt-2">
              <div>
                <Typography variant="h3" color={colors.grey[100]}>
                  {showAirtime ? "Airtime Benefits" : "Handset Benefits"}
                </Typography>
              </div>

              <div className="ms-auto me-md-5">
                {currentUser.EmploymentCategory !== "Temporary" && (
                  <Button
                    onClick={() => setShowAirtime(!showAirtime)}
                    style={{
                      fontSize: "13px",
                      height: "auto",
                      backgroundColor: "#1A69AC",
                      color: "#fff",
                      padding: "8px 30px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      borderColor: "#1A69AC",
                      border: "1px solid",
                    }}
                  >
                    {!showAirtime ? "Show Airtime" : "Show Handset"}
                  </Button>
                )}
              </div>
            </div>

            {currentUser.EmploymentCategory !== "Temporary" && (
              <>
                <div className="row">
                  <div className="col-12 rounded-3 align-self-start d-flex flex-column p-4 b-g mt-5 me-5 mx-3">
                    <div className="position-relative">
                      <div className="row justify-content-start">
                        <div
                          className="col-md-3 col-lg-5 rounded-3 mb-2 mb-md-0 p-4 align-items-center me-3"
                          style={{ backgroundColor: "#0096D6", color: "white" }}
                        >
                          <Typography>
                            {showAirtime
                              ? "Qualifying Airtime Allowance"
                              : "Qualifying Handset Amount"}
                          </Typography>
                          {isLoadingAirtime || isLoadingHandset ? (
                            <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                              <CircularProgress size={20} sx={{ color: "white" }} />
                              <Typography variant="body2" sx={{ ml: 1, color: "white" }}>
                                Loading...
                              </Typography>
                            </Box>
                          ) : (
                            <p className="mt-1 text-center">
                              N${" "}
                              {(showAirtime
                                ? Number(
                                    noContract?.airtimeAllocation ??
                                      airtimeData?.airtimeAllocation
                                  ).toFixed(2)
                                : Number(
                                    handsetData?.handsetAllocation ??
                                      noHandset?.handsetAllocation
                                  ).toFixed(2)) ?? 0}
                            </p>
                          )}
                        </div>
                        {showAirtime && (
                          <div
                            className="col-md-3 col-lg-5 rounded-3 mb-2 mb-md-0 shadow p-4 align-items-center me-3"
                            style={{ backgroundColor: "#0096D6", color: "white" }}
                          >
                            <Typography>SUL Balance</Typography>
                            {isLoadingAirtime ? (
                              <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                                <CircularProgress size={20} sx={{ color: "white" }} />
                                <Typography variant="body2" sx={{ ml: 1, color: "white" }}>
                                  Loading...
                                </Typography>
                              </Box>
                            ) : (
                              <p className="mt-1 text-center">
                                N${" "}
                                {(showAirtime
                                  ? Number(
                                      noContract?.sul ?? airtimeData?.sul
                                    ).toFixed(2)
                                  : handsetData[0]?.HandsetAllocation -
                                    handsetData[0]?.MonthlyPayment) || 0}
                              </p>
                            )}
                          </div>
                        )}
                        {showAirtime && (
                          <div
                            className="col-md-3 col-lg-5 rounded-3 mb-2 mb-md-0 shadow p-4 align-items-center mt-lg-4 me-3"
                            style={{ backgroundColor: "#0096D6", color: "white" }}
                          >
                            <Typography>Available Wallet</Typography>
                            {isLoadingAirtime ? (
                              <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                                <CircularProgress size={20} sx={{ color: "white" }} />
                                <Typography variant="body2" sx={{ ml: 1, color: "white" }}>
                                  Loading...
                                </Typography>
                              </Box>
                            ) : (
                              <p className="mt-1 text-center">
                                N${" "}
                                {showAirtime
                                  ? Number(
                                      noContract?.available ?? airtimeData.available
                                    ).toFixed(2)
                                  : 0.7 * (handsetData[0]?.HandsetAllocation || 0) -
                                    handsetData.reduce(
                                      (total, item) =>
                                        total + (item.MonthlyPayment || 0),
                                      0
                                    )}
                              </p>
                            )}
                          </div>
                        )}

                        {!showAirtime && (
                          <div
                            className="col-md-3 col-lg-5 rounded-3 shadow p-4 align-items-center"
                            style={{ backgroundColor: "#0096D6", color: "white" }}
                          >
                            <Typography>New Handset Date</Typography>
                            <p className="mt-1 text-center">
                              {handsetData?.handsets?.length > 0
                                ? handsetData?.handsets[0]?.RenewalDate === null
                                  ? "Pending Announcement"
                                  : formatDate(
                                      handsetData?.handsets[0]?.RenewalDate
                                    )
                                : formatDate(noHandset?.twoYearsLater) || "-"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 ml-1 d-flex flex-column">
                    <div className="m-1 m-sm-3">
                      {isLoadingAirtime || isLoadingHandset ? (
                        <Box 
                          m="40px 0 0 0" 
                          height="400px" 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center"
                          sx={{ backgroundColor: colors.primary[400] }}
                        >
                          <Box textAlign="center">
                            <CircularProgress size={40} sx={{ color: colors.blueAccent[500] }} />
                            <Typography variant="h6" sx={{ mt: 2, color: colors.grey[100] }}>
                              Loading data...
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          m="40px 0 0 0"
                          height="100%"
                          sx={{
                            "& .MuiDataGrid-root": { border: "none" },
                            "& .MuiDataGrid-cell": { borderBottom: "none" },
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
                            rows={showAirtime ? airtimeRows : handsetRows}
                            columns={showAirtime ? airtimeColumns : handsetColumns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            checkboxSelection
                            disableSelectionOnClick
                          />
                        </Box>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {currentUser.EmploymentCategory === "Temporary" && (
              <div className="col-11 rounded-3 align-self-start d-flex flex-column p-4 b-g mt-1 me-5">
                <div className="position-relative">
                  <div className="row justify-content-start">
                    <div
                      className="col-md-6 col-lg-8 rounded-3 p-4 align-items-center mb-3"
                      style={{ backgroundColor: "#0096D6", color: "white" }}
                    >
                      <Typography variant="h6">Airtime Allowance</Typography>
                      {isLoadingTemp ? (
                        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
                          <CircularProgress size={24} sx={{ color: "white" }} />
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            Loading...
                          </Typography>
                        </Box>
                      ) : (
                        <p className="mt-2" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                          N$ {tempData.AirtimeAllocation || "0.00"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Temporary User Quick Actions */}
                  <div className="row mt-3">
                    <div className="col-12">
                      <Typography variant="h6" className="mb-3" style={{ color: colors.grey[100] }}>
                        Quick Actions
                      </Typography>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/user/Support")}
                          style={{ 
                            borderColor: "#0096D6", 
                            color: "#0096D6",
                            marginRight: "10px",
                            marginBottom: "10px"
                          }}
                        >
                          Get Support
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/user/Profile")}
                          style={{ 
                            borderColor: "#1674BB", 
                            color: "#1674BB",
                            marginRight: "10px",
                            marginBottom: "10px"
                          }}
                        >
                          Staff Information
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
