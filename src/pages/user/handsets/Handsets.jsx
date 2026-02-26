import React, { useEffect, useState } from "react";
import { Box, Button, useTheme, CircularProgress, Typography } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ShareIcon from "@mui/icons-material/Share";
import { useSelector, useDispatch } from "react-redux";
import Tooltip from '@mui/material/Tooltip';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import axiosInstance from "../../../utils/axiosInstance";
import BenefitVoucher from "../../../components/global/BenefitVoucher";
import HandsetVoucher from "../../../components/global/HandsetVoucher";
import ShareIMEIModal from "../../../components/user/ShareIMEIModal";
import formatDate from "../../../components/global/dateFormatter";
import Swal from "sweetalert2";

const UserHandsets = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [dataAllocation, setDataAllocation] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [imeiModalOpen, setImeiModalOpen] = useState(false);
  const [selectedHandsetForIMEI, setSelectedHandsetForIMEI] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { role } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  console.log("My HANDSET User: ",currentUser)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/handsets/handset/${currentUser.EmployeeCode}`
        );
        const handsetData = Array.isArray(response.data) ? response?.data : [];
        setDataAllocation(handsetData);
        console.log("Handset data received:", response.data);
        console.log("First handset RenewalVerified:", handsetData[0]?.RenewalVerified);
      } catch (error) {
        // console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);
  

  const handleOpen = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/staffmember/allocation/handset/${currentUser.EmployeeCode}`
      );
      // console.log("Response data:", response.data); // Log the response to inspect its structure
      if (Array.isArray(response?.data?.staffWithAirtimeAllocation
) && response?.data?.staffWithAirtimeAllocation
.length > 0) {
        setUserData(response.data[0]); // Assuming you want the first element in the array
        setModalOpen(true);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => setModalOpen(false);

  const handleOpenIMEIModal = (handset) => {
    setSelectedHandsetForIMEI(handset);
    setImeiModalOpen(true);
  };

  const handleCloseIMEIModal = () => {
    setImeiModalOpen(false);
    setSelectedHandsetForIMEI(null);
  };

  const handleShareIMEI = async (handsetId, imeiNumber) => {
    try {
      const response = await axiosInstance.post(`/handsets/share-imei/${handsetId}`, {
        imeiNumber: imeiNumber
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "IMEI Shared Successfully!",
          text: `Your device IMEI has been shared with the admin team. ${response.data.data.adminNotified} admin members have been notified.`,
        }).then(() => {
          // Refresh the data
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error sharing IMEI:", error);
      throw new Error(error.response?.data?.message || "Failed to share IMEI number");
    }
  };

  const handleHandsetDelection = async (id) =>{
    Swal.fire({
    icon: "warning", // Corrected 'waring' to 'warning'
    title: "Are you sure?", // Added question mark for clarity
    text: "You won't be able to revert this! Confirm to delete the handset.", // More appropriate text for a confirmation
    showCancelButton: true, // Show a cancel button
    confirmButtonColor: "#d33", // Red for delete
    cancelButtonColor: "#3085d6", // Blue for cancel
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
  }).then(async (result) => { // Make this callback function 'async'
    if (result.isConfirmed) { // Only proceed if the user clicked "Yes, delete it!"
      try {
        setIsDeleting(true);
        const response = await axiosInstance.delete(
          `/handsets/deletion/${id}`
        );

        // Check if the request was successful (status 200)
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Handset Deleted!",
            text: "The handset has been successfully removed.",
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
      } finally {
        setIsDeleting(false);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User clicked "No, cancel!" or dismissed the dialog
      Swal.fire({
        icon: "info",
        title: "Cancelled",
        text: "Handset deletion was cancelled.",
        timer: 1500, // Optional: auto-close after 1.5 seconds
        showConfirmButton: false
      });
    }
  });
  }

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
    { field: "Status", headerName: "Status", width: 100 },
    { field: "RenewalVerified", headerName: "Renewal Verified", width: 140 },
    { field: "IMEINumber", headerName: "IMEI Number", width: 150 },
    {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
              field: "actions",
              type: "actions",
              headerName: "Actions",
              width: 150,
              cellClassName: "actions",
              getActions: ({ row }) => { // Destructure 'row' from the params object
          const actions = [];
    
          // Add delete action if status is 'Pending'
          if (row.Status === "Pending") {
            console.log("Approval status: ",row.Status)
            actions.push(
              <Tooltip title={`Delete handset`} arrow>
                <GridActionsCellItem
                  icon={<RemoveCircleIcon />}
                  label="delete"
                  className="textPrimary"
                  onClick={() => { handleHandsetDelection(row.id)}}
                  color="inherit"
                />
              </Tooltip>
            );
          }

          // Add share IMEI action if renewal is verified
          console.log("Row data for actions:", {
            id: row.id,
            RenewalVerified: row.RenewalVerified,
            Status: row.Status,
            IMEINumber: row.IMEINumber,
            shouldShowIMEI: (row.RenewalVerified === true || row.RenewalVerified === "Yes") && 
                           (row.Status === "Renewal Verified" || row.Status === "Probation Verified")
          });
          
          if ((row.RenewalVerified === true || row.RenewalVerified === "Yes") && 
              (row.Status === "Renewal Verified" || row.Status === "Probation Verified")) {
            actions.push(
              <Tooltip title={`Share IMEI with admin`} arrow>
                <GridActionsCellItem
                  icon={<ShareIcon />}
                  label="Share IMEI"
                  className="textPrimary"
                  onClick={() => { handleOpenIMEIModal(row)}}
                  color="primary"
                />
              </Tooltip>
            );
          }
          return actions; // Return the array of actions (which might be empty)
        },
      },
  ];

  const rows = dataAllocation?.map((handset, index) => {
    console.log("Mapping handset:", {
      id: handset.id,
      RenewalVerified: handset.RenewalVerified,
      Status: handset.status || handset.Status,
      IMEINumber: handset.IMEINumber
    });
    
    return {
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
      Status: handset.status || handset.Status,
      RenewalVerified: handset.RenewalVerified ? "Yes" : "No",
      IMEINumber: handset.IMEINumber || "Not provided",
    };
  });
  const today = new Date(); 
  const shouldShowNewHandsetButton =
  dataAllocation.length === 0 || dataAllocation[0].status === "Rejected" ||
  (dataAllocation[0]?.RenewalDate &&
    new Date(dataAllocation[0].RenewalDate) <= today); 

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <h2>My Handsets</h2>
          <p>
            Keep track of your handset benefits, view your current packages and
            monthly updates.
          </p>
        </div>

        {/* Learn More */}
        {dataAllocation.length > 0 ? (
          <Box>
            <div
              className="col-12 col-lg-11 rounded-3 d-flex justify-content-around flex-column p-4 b-g mx-auto"
              style={{ backgroundColor: "#F5F5F5" }}
            >
              <div className="position-relative">
                <div className="d-flex row">
                  {/* Qualifying Allowance */}
                  <div className="col-sm-4 border-end border-light-subtle p-4">
                    <div className="row g-5">
                      <div className="col-md-6">
                        <h5>Active Handset</h5>
                        <p>{dataAllocation[0].HandsetName}</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <PhoneIphoneIcon fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 border-end border-light-subtle p-4">
                    <div className="row g-5">
                      <div className="col-md-6">
                        <h5>Handset Price</h5>
                        <p>N$ {dataAllocation[0].HandsetPrice}</p>
                      </div>
                      <div
                        className="col-sm-2 align-self-start rounded-3 shadow d-flex justify-content-center p-2"
                        style={{ backgroundColor: "#0096D6", color: "white" }}
                      >
                        <FaMoneyBillTrendUp fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 p-4">
                    <div className="row g-5">
                      <div className="col-md-6">
                        <h5>New Handset Due:</h5>
                        <p>{formatDate(dataAllocation[0]?.RenewalDate) || "Pending Announcement"}</p>
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
          <h3 className="text-center mt-5 text-danger">
            Your Handset Information will be shown here once you get one
          </h3>
        )}
        <div style={{ height: "100%" }}>
          <HandsetVoucher
            style={{ height: "100%" }}
            open={modalOpen}
            handleClose={handleClose}
            userData={userData}
            role={role}
          />
          <ShareIMEIModal
            open={imeiModalOpen}
            handleClose={handleCloseIMEIModal}
            handsetData={selectedHandsetForIMEI}
            onShareIMEI={handleShareIMEI}
          />
        </div>
        {/* Plan Table */}
        <div className="col-12 col-lg-11 ml-1 d-flex flex-column">
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
              {
                shouldShowNewHandsetButton && (
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
                      backgroundColor: isLoading ? "#ccc" : "#0096D6",
                      color: "#fff",
                      padding: "8px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      borderRadius: "5px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      borderColor: "#1A69AC",
                      border: "1px solid",
                    }}
                    onClick={handleOpen}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={16} sx={{ color: "white" }} />
                        Loading...
                      </>
                    ) : (
                      <>
                        New Handset
                        <PostAddIcon size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
                )
              }
              {isLoading ? (
                <Box 
                  height="400px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  sx={{ backgroundColor: colors.primary[400] }}
                >
                  <Box textAlign="center">
                    <CircularProgress size={40} sx={{ color: colors.blueAccent[500] }} />
                    <Typography variant="h6" sx={{ mt: 2, color: colors.grey[100] }}>
                      Loading handsets...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  checkboxSelection
                  disableSelectionOnClick
                  // onRowClick={handleRowClick}
                />
              )}
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHandsets;
