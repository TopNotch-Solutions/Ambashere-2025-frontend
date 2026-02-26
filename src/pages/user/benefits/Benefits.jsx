import React, { useEffect, useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import BenefitVoucher from "../../../components/global/BenefitVoucher";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Tooltip from '@mui/material/Tooltip';
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";

const UserBenefits = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const { role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/contracts/${currentUser.EmployeeCode}`
        );
        setData(response.data.contracts || []);
      } catch (error) {
        // console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleContractDelection = async (id) => {
  Swal.fire({
    icon: "warning", // Corrected 'waring' to 'warning'
    title: "Are you sure?", // Added question mark for clarity
    text: "You won't be able to revert this! Confirm to delete the contract.", // More appropriate text for a confirmation
    showCancelButton: true, // Show a cancel button
    confirmButtonColor: "#d33", // Red for delete
    cancelButtonColor: "#3085d6", // Blue for cancel
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
  }).then(async (result) => { // Make this callback function 'async'
    if (result.isConfirmed) { // Only proceed if the user clicked "Yes, delete it!"
      try {
        const response = await axiosInstance.delete(
          `/contracts/deletion/${id}`
        );

        // Check if the request was successful (status 200)
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Contract Deleted!",
            text: "The contract has been successfully removed.",
          }).then((reloadResult) => { // Changed result variable name to avoid conflict
            // Reload the page after the user clicks "OK" on the Swal alert
            if (reloadResult.isConfirmed) {
              window.location.reload();
            }
          });
        }
      } catch (error) {
        console.error("Error deleting contract:", error); // Use console.error for errors
        // Display an error Swal if the deletion failed (e.g., due to 403, 404, or network issues)
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: error.response?.data?.message || "An unexpected error occurred during deletion. Please try again.",
        });
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User clicked "No, cancel!" or dismissed the dialog
      Swal.fire({
        icon: "info",
        title: "Cancelled",
        text: "Contract deletion was cancelled.",
        timer: 1500, // Optional: auto-close after 1.5 seconds
        showConfirmButton: false
      });
    }
  });
};

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "PackageName", headerName: "PACKAGE NAME", width: 220 },
    { field: "DeviceName", headerName: "DEVICE NAME", width: 220 },
    { field: "ContractDuration", headerName: "PAYEMENT DURATION", width: 210 },
    { field: "ContractStartDate", headerName: "ALLOCATION DATE", width: 180 },
    { field: "SubscriptionStatus", headerName: "STATUS", width: 180 },
    { field: "MonthlyPayment", headerName: "MONTHLY PAYMENT", width: 180 },
    {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
          field: "actions",
          type: "actions",
          headerName: "Actions",
          width: 100,
          cellClassName: "actions",
          getActions: ({ row }) => { // Destructure 'row' from the params object
      const actions = [];

      // Only add the delete action if approvalStatus is 'Pending'
      if (row.ApprovalStatus === "Pending") {
        console.log("Approval status: ",row.ApprovalStatus)
        actions.push(
          <Tooltip title={`Delete contract`} arrow> {/* Add Tooltip here */}
            <GridActionsCellItem
              icon={<RemoveCircleIcon />}
              label="delete"
              className="textPrimary"
              onClick={() => { handleContractDelection(row.id)}}
              color="inherit"
            />
          </Tooltip>
        );
      }
      return actions; // Return the array of actions (which might be empty)
    },
  },
];

  const rows = data?.map((contract, index) => ({
    id: contract.ContractNumber,
    PackageName: contract.PackageName,
    DeviceName: contract.DeviceName,
    ContractDuration: contract.ContractDuration,
    ContractStartDate: contract.ContractStartDate,
    SubscriptionStatus: contract.SubscriptionStatus,
    MonthlyPayment: "N$ " + contract.MonthlyPayment,
    ApprovalStatus: contract.ApprovalStatus
  }));

  const handleOpen = async () => {
    try {
      const response = await axiosInstance.get(
        `/staffmember/allocation/${currentUser.EmployeeCode}`
      );
      // console.log("Response data:", response.data); // Log the response to inspect its structure
      if(response.status === 200){
        setUserData(response.data); // Assuming you want the first element in the array
        setModalOpen(true)
      }else{
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleClose = () => setModalOpen(false);

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <h2>My Benefits</h2>
          <p>
            View and manage your employee benefits, including airtime, handset
            allowances, and discounts. Keep track of your entitlements and
            explore available options.
          </p>
        </div>
        {currentUser.EmploymentCategory === "Temporary" && (
          <h3 className="text-center mt-5 text-danger">
            Your Staff Benefits Information will be shown here once you get one
          </h3>
        )}

        {/* Airtime Stats */}
        {currentUser.EmploymentCategory !== "Temporary" && (
          <>
            {data.length > 0 ? (
              <Box>
                <div
                  className="col-12 col-lg-12 rounded-3 d-flex justify-content-around flex-column p-4 b-g mx-auto"
                  style={{ backgroundColor: "#F5F5F5" }}
                >
                  <div className="position-relative">
                    <div className="d-flex row">
                      <div className="col-sm-6 border-end border-light-subtle p-2">
                        <div className="row g-5">
                          <div className="col-md-7">
                            <h5>Active Packages</h5>
                            <h3>
                              {data?.filter((item) => item.PackageName && item.SubscriptionStatus !== 'Expired')
                                ?.length || 0}
                            </h3>
                          </div>
                          <div
                            className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                            style={{
                              backgroundColor: "#0096D6",
                              color: "white",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faBoxOpen}
                              fontSize="large"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-sm-6 p-2">
                        <div className="row g-5">
                          <div className="col-md-7">
                            <h5>Active Device</h5>
                            <h3>
                              {data?.filter((item) => item.DeviceName && item.SubscriptionStatus !== 'Expired')
                                ?.length || 0}
                            </h3>
                          </div>
                          <div
                            className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                            style={{
                              backgroundColor: "#0096D6",
                              color: "white",
                            }}
                          >
                            <EventAvailableIcon fontSize="large" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            ) : (
              <h3 className="text-center mt-5 text-danger">
                Your Staff Benefits Information will be shown here once you get
                one
              </h3>
            )}

            <div style={{ height: "100%" }}>
              <BenefitVoucher
                style={{ height: "100%" }}
                open={modalOpen}
                handleClose={handleClose}
                userData={userData}
                role={role}
              />
            </div>

            {/* Plan Table */}
            <div className="col-12 ml-1 d-flex flex-column">
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "70px",
                      }}
                    >
                      <Button
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
                        New Contract Application
                        <PostAddIcon size={16} />
                      </Button>
                    </div>
                  </div>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    disableSelectionOnClick
                    // onRowClick={handleRowClick}
                  />
                </Box>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserBenefits;
