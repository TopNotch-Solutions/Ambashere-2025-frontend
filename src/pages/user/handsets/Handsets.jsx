import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useTheme,
  CircularProgress,
  Typography,
} from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShareIcon from "@mui/icons-material/Share";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import axiosInstance from "../../../utils/axiosInstance";
import HandsetVoucher from "../../../components/global/HandsetVoucher";
import ShareIMEIModal from "../../../components/user/ShareIMEIModal";
import formatDate from "../../../components/global/dateFormatter";
import { formatMoney } from "../../../utils/formatMoney";
import Swal from "sweetalert2";
import HandsetBenfitSimulator from "../self-help/HandsetBenefitSimulator";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";

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
  const [showSimulator, setShowSimulator] = useState(false);
  const { role } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/handsets/handset/${currentUser.EmployeeCode}`,
        );
        const handsetData = Array.isArray(response.data) ? response?.data : [];
        setDataAllocation(handsetData);
      } catch (error) {
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
        `/staffmember/allocation/handset/${currentUser.EmployeeCode}`,
      );
      if (
        Array.isArray(response?.data?.staffWithAirtimeAllocation) &&
        response?.data?.staffWithAirtimeAllocation.length > 0
      ) {
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
      const response = await axiosInstance.post(
        `/handsets/share-imei/${handsetId}`,
        {
          imeiNumber: imeiNumber,
        },
      );

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
      throw new Error(
        error.response?.data?.message || "Failed to share IMEI number",
      );
    }
  };

  const handleHandsetDelection = async (id) => {
    Swal.fire({
      icon: "warning", // Corrected 'waring' to 'warning'
      title: "Are you sure?", // Added question mark for clarity
      text: "You won't be able to revert this! Confirm to delete the handset.", // More appropriate text for a confirmation
      showCancelButton: true, // Show a cancel button
      confirmButtonColor: "#d33", // Red for delete
      cancelButtonColor: "#3085d6", // Blue for cancel
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      // Make this callback function 'async'
      if (result.isConfirmed) {
        // Only proceed if the user clicked "Yes, delete it!"
        try {
          setIsDeleting(true);
          const response = await axiosInstance.delete(
            `/handsets/deletion/${id}`,
          );

          // Check if the request was successful (status 200)
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Handset Deleted!",
              text: "The handset has been successfully removed.",
            }).then((reloadResult) => {
              // Changed result variable name to avoid conflict
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
            text:
              error.response?.data?.message ||
              "An unexpected error occurred during deletion. Please try again.",
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
          showConfirmButton: false,
        });
      }
    });
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").trim().toLowerCase();

    if (normalized === "pending") {
      return { background: "#FEF3C7", color: "#92400E", border: "#F59E0B" };
    }
    if (normalized === "in progress") {
      return { background: "#DBEAFE", color: "#1E40AF", border: "#3B82F6" };
    }
    if (
      normalized === "completed" ||
      normalized === "expired" ||
      normalized === "rejected" ||
      normalized === "inactive" ||
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return { background: "#FEE2E2", color: "#991B1B", border: "#EF4444" };
    }
    if (
      normalized === "active" ||
      normalized === "ongoing" ||
      normalized === "renewed" ||
      normalized === "approved" ||
      normalized === "done"
    ) {
      return { background: "#DCFCE7", color: "#166534", border: "#22C55E" };
    }

    return { background: "#F3F4F6", color: "#374151", border: "#9CA3AF" };
  };

  const formatStatusLabel = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    if (normalized === "completed") return "Expired";
    return status || "-";
  };

  const columns = [
    // { field: "id", headerName: "#", width: 60 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 130 },
    { field: "FixedAssetCode", headerName: "Fixed Asset Code", width: 150 },
    { field: "HandsetName", headerName: "Handset Name", width: 180 },
    { field: "DevicePrice", headerName: "Handset Price", width: 140 },
    // { field: "ExccessPrice", headerName: "Exccess Price", width: 140 },
    // { field: "RequestDate", headerName: "Requested Date", width: 180 },
    { field: "AllocationDate", headerName: "Collected Date", width: 180 },
    { field: "NewAllocationDate", headerName: "New Renewal Date", width: 180 },
    {
      field: "Status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = params.value || "-";
        const style = getStatusStyle(status);

        return (
          <span
            className="benefit-status-badge"
            style={{
              backgroundColor: style.background,
              color: style.color,
              borderColor: style.border,
            }}
          >
            {formatStatusLabel(status)}
          </span>
        );
      },
    },
    // { field: "RenewalVerified", headerName: "Renewal Verified", width: 140 },
    // { field: "IMEINumber", headerName: "IMEI Number", width: 150 },
    // {
    //   field: "actions",
    //   type: "actions",
    //   headerName: "Actions",
    //   width: 150,
    //   cellClassName: "actions",
    //   getActions: ({ row }) => {
    //     // Destructure 'row' from the params object
    //     const actions = [];

    //     // Add delete action if status is 'Pending'
    //     if (row.Status === "Pending") {
    //       actions.push(
    //         <Tooltip title={`Delete handset`} arrow>
    //           <GridActionsCellItem
    //             icon={<RemoveCircleIcon />}
    //             label="delete"
    //             className="textPrimary"
    //             onClick={() => {
    //               handleHandsetDelection(row.id);
    //             }}
    //             color="inherit"
    //           />
    //         </Tooltip>,
    //       );
    //     }

    //     // Add share IMEI action if renewal is verified
    //       id: row.id,
    //       RenewalVerified: row.RenewalVerified,
    //       Status: row.Status,
    //       IMEINumber: row.IMEINumber,
    //       shouldShowIMEI:
    //         (row.RenewalVerified === true || row.RenewalVerified === "Yes") &&
    //         (row.Status === "Renewal Verified" ||
    //           row.Status === "Probation Verified"),
    //     });

    //     if (
    //       (row.RenewalVerified === true || row.RenewalVerified === "Yes") &&
    //       (row.Status === "Renewal Verified" ||
    //         row.Status === "Probation Verified")
    //     ) {
    //       actions.push(
    //         <Tooltip title={`Share IMEI with admin`} arrow>
    //           <GridActionsCellItem
    //             icon={<ShareIcon />}
    //             label="Share IMEI"
    //             className="textPrimary"
    //             onClick={() => {
    //               handleOpenIMEIModal(row);
    //             }}
    //             color="primary"
    //           />
    //         </Tooltip>,
    //       );
    //     }
    //     return actions; // Return the array of actions (which might be empty)
    //   },
    // },
  ];

  const rows = dataAllocation?.map((handset, index) => {

    return {
      id: handset.id,
      EmployeeCode: handset.EmployeeCode,
      HandsetName: handset.HandsetName,
      DevicePrice: formatMoney(handset.HandsetPrice),
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
    dataAllocation.length === 0 ||
    dataAllocation[0].status === "Rejected" ||
    (dataAllocation[0]?.RenewalDate &&
      new Date(dataAllocation[0].RenewalDate) <= today);

  return (
    <div className="container-main m-3 handset-simulator-page benefits-page">
      <div className="handset-hero mb-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        <div>
          <h2 className="handset-title">My Staff Handsets</h2>
          <p className="handset-subtitle mb-0">
            Keep track of your handset benefits, active handset details, and
            renewal timeline.
          </p>
        </div>
        <Button
          className="benefits-cta-btn"
          onClick={() => setShowSimulator((prev) => !prev)}
        >
          {showSimulator ? "Back to My Staff Handsets" : "Simulate Staff Handset"}
        </Button>
      </div>
      {showSimulator ? (
        <HandsetBenfitSimulator embedded />
      ) : (
        <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
          {/* Learn More */}
          {!isLoading && dataAllocation.length > 0 ? (
            <Box className="col-12 col-lg-12">
              <div className="handset-summary-card shadow-sm benefits-stats-card">
                <div className="row g-3">
                  <div className="col-sm-4">
                    <div className="benefit-metric">
                      <div>
                        <h5>Active Staff Handset</h5>
                        <h3>{dataAllocation[0].HandsetName}</h3>
                      </div>
                      <div className="benefit-metric-icon">
                        <PhoneIphoneIcon fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="benefit-metric">
                      <div>
                        <h5>Staff Handset Price</h5>
                        <h3>{formatMoney(dataAllocation[0].HandsetPrice)}</h3>
                      </div>
                      <div className="benefit-metric-icon">
                        <FaMoneyBillTrendUp fontSize="large" />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4">
                    <div className="benefit-metric">
                      <div>
                        <h5>New Staff Handset Due</h5>
                        <h3>
                          {formatDate(dataAllocation[0]?.RenewalDate) ||
                            "Pending"}
                        </h3>
                      </div>
                      <div className="benefit-metric-icon">
                        <CalendarMonthIcon fontSize="large" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          ) : !isLoading && dataAllocation.length === 0 ? (
            <Box className="col-12">
              <div className="handset-form-card shadow-sm handset-empty-state">
                <div className="handset-empty-state-icon" aria-hidden="true">
                  <PhoneIphoneIcon />
                </div>
                <h5 className="mb-2">No staff handset on record</h5>
                <p className="mb-3">
                  We could not find a staff handset linked to your profile. If
                  you have been issued a company handset and it is not showing
                  here, please log a support request so the Ambasphere team can
                  review and update your records.
                </p>
                <Button
                  className="benefits-cta-btn"
                  startIcon={<SupportAgentIcon />}
                  onClick={() => navigate("/user/Support")}
                >
                  Log a Support Request
                </Button>
              </div>
            </Box>
          ) : null}
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
          {(isLoading || dataAllocation.length > 0) && (
          <div className="col-12 ml-1 d-flex flex-column">
            <div className="m-1 m-sm-3">
              <Box
                m="0"
                height="100%"
                className="handset-form-card shadow-sm benefits-table-card"
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
                    backgroundColor: "#1674BB", color: "white",
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
                <div className="benefits-table-header">
                  <h6 className="summary-title mb-0">Current Handsets</h6>
                  {/* {shouldShowNewHandsetButton && (
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
                  )} */}
                </div>
                {isLoading ? (
                  <Box
                    height="400px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ backgroundColor: colors.primary[400] }}
                  >
                    <Box textAlign="center">
                      <CircularProgress
                        size={40}
                        sx={{ color: colors.blueAccent[500] }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ mt: 2, color: colors.grey[100] }}
                      >
                        Loading handsets...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <div className="benefits-grid-wrap current-handsets-grid">
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10, 20, 30]}
                      checkboxSelection
                      disableSelectionOnClick
                      // onRowClick={handleRowClick}
                    />
                  </div>
                )}
              </Box>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHandsets;
