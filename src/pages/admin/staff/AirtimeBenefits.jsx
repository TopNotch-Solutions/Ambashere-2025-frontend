import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import ExportButton from "../../../components/admin/ExportButton";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import BenefitAdminVoucher from "../../../components/global/BenefitAdminVoucher";

const AirtimeBenefits = () => {
  const { employeeCode } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const [userDataQ, setUserDataQ] = useState(null);
  const [handsetData, setHandsetData] = useState([]);
  const { role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [setSelectedTab] = useState("personal");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/${employeeCode}`);
        setData(response.data.contracts || []);
      } catch (error) {
        // console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() =>{
    const handleOpenEffect = async () => {
    try {
      const response = await axiosInstance.get(
        `/staffmember/allocation/${employeeCode}`
      );
      // console.log("Response data:", response.data); // Log the response to inspect its structure
      if (Array.isArray(response?.data?.staffWithAirtimeAllocation)) {
        console.log("gggggg: ",response.data)
        setUserDataQ(response.data); // Assuming you want the first element in the array
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  handleOpenEffect();
  },[])

  const columns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "DeviceName", headerName: "DEVICE", width: 240 },
    { field: "PackageName", headerName: "PACKAGE", width: 210 },
    { field: "MonthlyPayment", headerName: "MONTHLY PAYMENT", width: 200 },
    { field: "ContractDuration", headerName: "CONTRACT DURATION", width: 200 },
    { field: "ContractStartDate", headerName: "ALLOCATION DATE", width: 180 },
  ];

  const rows = data.map((airtime, index) => ({
    id: index + 1,
    DeviceName: airtime.DeviceName,
    PackageName: airtime.PackageName,
    MonthlyPayment: "N$ " + airtime.MonthlyPayment,
    ContractDuration: airtime.ContractDuration,
    ContractStartDate: airtime.ContractStartDate,
  }));

  const handleOpen = async () => {
    try {
      const response = await axiosInstance.get(
        `/staffmember/allocation/${employeeCode}`
      );
      // console.log("Response data:", response.data); // Log the response to inspect its structure
      if (Array.isArray(response?.data?.staffWithAirtimeAllocation)) {
        setUserData(response.data); // Assuming you want the first element in the array
        setModalOpen(true);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleClose = () => setModalOpen(false);

  return (
    <Box m="10px">
      <div style={{ height: "100%" }}>
        {/* Top Section */}
        {data.length > 0 ? (
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
                        <p>Qualiying Allowance</p>
                        <p>N$ {userDataQ?.staffWithAirtimeAllocation[0]?.AirtimeAllocation}</p>
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
                        <p>Available Allowance</p>
                        <p>
                          N${" "}
                          {userDataQ?.available}
                        </p>
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
                        <p>New Allowance</p>
                        <p>
                          N${" "}
                          {
  (() => {
    // Safely get the values, defaulting to 0 if undefined or null
    const airtimeAllocation = userDataQ?.staffWithAirtimeAllocation?.[0]?.AirtimeAllocation || 0;
    const available = userDataQ?.available || 0;

    // Calculate the initial result
    let result = (0.30 * airtimeAllocation) + available;

    // Apply the condition: if result is less than 0, use 30% of airtimeAllocation
    if (result < 0) {
      result = (0.30 * airtimeAllocation);
    }

    // Format to 2 decimal places.
    // Handle NaN case: if 'result' is NaN, return '0.00'
    return Number.isNaN(result) ? '0.00' : result.toFixed(2);
  })()
}
                        </p>
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
          <div className="text-danger text-center my-4 fw-bold">
            No airtime information is currently available for this user.
          </div>
        )}

        <div style={{ height: "100%" }}>
          <BenefitAdminVoucher
            style={{ height: "100%" }}
            open={modalOpen}
            handleClose={handleClose}
            userData={userData}
            role={role}
          />
        </div>

        <Box
          m="40px 0 0 0"
          height="35vh"
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "9px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "70px",
              }}
            >
              {/* <Button
                className=""
                style={{
                  gap: "10px",
                  height: " 100%",
                  backgroundColor: "#0096D6",
                  color: "#fff",
                  padding: "8px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  borderColor: "#1A69AC",
                  border: "1px solid",
                }}
                onClick={handleOpen}
              >
                New Allocation
                <PostAddIcon size={16} />
              </Button> */}
              <ExportButton data={userDataQ} fileName={"Contract details"}/>
            </div>
          </div>

          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </div>
    </Box>
  );
};

export default AirtimeBenefits;
