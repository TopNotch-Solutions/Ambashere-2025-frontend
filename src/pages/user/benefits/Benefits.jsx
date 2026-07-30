import React, { useEffect, useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BenefitVoucher from "../../../components/global/BenefitVoucher";
import PostAddIcon from "@mui/icons-material/PostAdd";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import formatDate from "../../../components/global/dateFormatter";
import { formatMoney } from "../../../utils/formatMoney";
import AirtimeBenefitSimulator from "../self-help/AirtimeBenefitSimulator";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";

const UserBenefits = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [simulationPrefill, setSimulationPrefill] = useState(null);
  const [simulationMeta, setSimulationMeta] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [availableAllowance, setAvailableAllowance] = useState(null);
  const [minPackagePrice, setMinPackagePrice] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);
  const { role } = useSelector((state) => state.auth);
  const isActiveStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    return (
      normalized === "active" ||
      normalized === "pending" ||
      normalized === "in progress"
    );
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
      normalized === "active" ||
      normalized === "ongoing" ||
      normalized === "renewed" ||
      normalized === "approved" ||
      normalized === "done"
    ) {
      return { background: "#DCFCE7", color: "#166534", border: "#22C55E" };
    }
    if (
      normalized === "expired" ||
      normalized === "rejected" ||
      normalized === "inactive" ||
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return { background: "#FEE2E2", color: "#991B1B", border: "#EF4444" };
    }

    return { background: "#F3F4F6", color: "#374151", border: "#9CA3AF" };
  };

  const hasDeviceName = (item) => {
    const value = item?.DeviceName ?? item?.device ?? "";
    const normalized = String(value).trim().toLowerCase();
    return normalized !== "" && normalized !== "null" && normalized !== "undefined";
  };

  const canSimulateAirtimeBenefit =
    availableAllowance != null &&
    minPackagePrice != null &&
    Number(availableAllowance) >= Number(minPackagePrice);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractsResponse, packagesResponse] = await Promise.all([
          axiosInstance.get(`/contracts/${currentUser.EmployeeCode}`),
          axiosInstance.get(`/packages/packageList?t=${Date.now()}`),
        ]);

        setData(contractsResponse.data.contracts || []);
        setAvailableAllowance(
          contractsResponse.data.available != null
            ? parseFloat(contractsResponse.data.available)
            : null
        );

        const packages = packagesResponse.data || [];
        const prices = packages
          .map((pkg) => parseFloat(pkg.MonthlyPrice))
          .filter((price) => !isNaN(price) && price > 0);
        setMinPackagePrice(prices.length ? Math.min(...prices) : null);
      } catch (error) {
        console.error("Error loading benefits eligibility:", error);
      }
    };

    if (currentUser?.EmployeeCode) {
      fetchData();
    }
  }, [currentUser?.EmployeeCode]);

  useEffect(() => {
    if (!canSimulateAirtimeBenefit && showSimulator) {
      setShowSimulator(false);
    }
  }, [canSimulateAirtimeBenefit, showSimulator]);

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
    { field: "PackageName", headerName: "PACKAGE NAME", width: 220 },
    { field: "DeviceName", headerName: "DEVICE NAME", width: 220 },
    { field: "MSISDN", headerName: "MSISDN", width: 180 },
    { field: "DevicePrice", headerName: "DEVICE PRICE", width: 180 },
    { field: "ContractDuration", headerName: "PAYEMENT DURATION", width: 210 },
    { field: "MonthlyPayment", headerName: "MONTHLY PAYMENT", width: 180 },
    { field: "PayoutBalance", headerName: "PAYOUT AMOUNT", width: 180 },
    { field: "ContractStartDate", headerName: "CONTRACT START", width: 180 },
    { field: "ContractEndDate", headerName: "CONTRACT END", width: 180 },
    {
      field: "SubscriptionStatus",
      headerName: "STATUS",
      width: 180,
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
            {status}
          </span>
        );
      },
    },
  //   {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  //         field: "actions",
  //         type: "actions",
  //         headerName: "Actions",
  //         width: 100,
  //         cellClassName: "actions",
  //         getActions: ({ row }) => { // Destructure 'row' from the params object
  //     const actions = [];

  //     // Only add the delete action if approvalStatus is 'Pending'
  //     if (row.ApprovalStatus === "Pending") {
  //       actions.push(
  //         <Tooltip title={`Delete contract`} arrow> {/* Add Tooltip here */}
  //           <GridActionsCellItem
  //             icon={<RemoveCircleIcon />}
  //             label="delete"
  //             className="textPrimary"
  //             onClick={() => { handleContractDelection(row.id)}}
  //             color="inherit"
  //           />
  //         </Tooltip>
  //       );
  //     }
  //     return actions; // Return the array of actions (which might be empty)
  //   },
  // },
];

  const rows = data?.map((contract, index) => ({
    id: `benefit-${contract?.id ?? contract?.ContractNumber ?? index + 1}`,
    PackageName: contract?.PackageName || contract?.package || "-",
    DeviceName: contract?.DeviceName || contract?.device || "-",
    MSISDN: contract?.MSISDN || contract?.msisdn || "-",
    DevicePrice: formatMoney(contract?.DevicePrice ?? contract?.device_initial_cost ?? 0),
    ContractDuration:
      contract?.ContractDuration != null || contract?.contract_duration != null
        ? String(
            Math.trunc(
              Number(contract?.ContractDuration ?? contract?.contract_duration)
            )
          )
        : "-",
    ContractStartDate: (() => {
      const status = String(
        contract?.SubscriptionStatus || contract?.subscription_status || ""
      )
        .trim()
        .toLowerCase();
      const isOpenSubmission =
        contract?.isSubmission ||
        status === "pending" ||
        status === "in progress";
      if (isOpenSubmission) return "-";
      return formatDate(
        contract?.ContractStartDate ?? contract?.contract_start_date
      );
    })(),
    ContractEndDate: formatDate(contract?.ContractEndDate ?? contract?.contract_end_date),
    
    MonthlyPayment: formatMoney(contract?.MonthlyPayment ?? contract?.monthly_payment ?? 0),
    PayoutBalance: formatMoney(contract?.device_payout_balance ?? contract?.device_payout_balance ?? 0),
    SubscriptionStatus: contract?.SubscriptionStatus || contract?.subscription_status || "-",
    ApprovalStatus: contract.ApprovalStatus
  }));

  const handleOpen = async () => {
    try {
      const response = await axiosInstance.get(
        `/staffmember/allocation/${currentUser.EmployeeCode}`
      );
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

  const handleClose = () => {
    setModalOpen(false);
    setSimulationPrefill(null);
    setSimulationMeta(null);
  };

  const handleApplySimulation = (prefillData, meta = null) => {
    setSimulationPrefill(prefillData);
    setSimulationMeta(meta);
    setModalOpen(true);
  };

  return (
    <div className="container-main m-3 handset-simulator-page benefits-page">
      <div className="handset-hero mb-4 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        <div>
          <h2 className="handset-title">My Benefits</h2>
          <p className="handset-subtitle mb-0">
            View and manage your airtime benefits, monitor active
            contracts, and simulate new contract applications.
          </p>
        </div>
        {(canSimulateAirtimeBenefit || showSimulator) && (
          <Button
            className="benefits-cta-btn"
            onClick={() => setShowSimulator((prev) => !prev)}
          >
            {showSimulator ? "Back to My Benefits" : "Simulate Airtime Benefit"}
          </Button>
        )}
      </div>

      <BenefitVoucher
        open={modalOpen}
        handleClose={handleClose}
        userData={userData}
        role={role}
        prefillData={simulationPrefill}
        simulationMeta={simulationMeta}
      />

      {showSimulator ? (
        <AirtimeBenefitSimulator
          embedded
          onApplySimulation={handleApplySimulation}
        />
      ) : (
        <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
          {currentUser.EmploymentCategory === "Temporary" && (
            <h3 className="text-center mt-5 text-danger benefits-empty-state">
              Your Staff Benefits Information will be shown here once you get one
            </h3>
          )}

          {/* Airtime Stats */}
          {currentUser.EmploymentCategory !== "Temporary" && (
            <>
              {data.length > 0 ? (
                <Box className="col-12">
                  <div className="handset-summary-card shadow-sm benefits-stats-card">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="benefit-metric">
                          <div>
                            <h5>Active Packages</h5>
                            <h3>
                              {data?.filter(
                                (item) =>
                                  item.PackageName &&
                                isActiveStatus(
                                  item.SubscriptionStatus ??
                                    item.subscription_status
                                )
                              )?.length || 0}
                            </h3>
                          </div>
                          <div className="benefit-metric-icon">
                            <FontAwesomeIcon icon={faBoxOpen} fontSize="large" />
                          </div>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="benefit-metric">
                          <div>
                            <h5>Active Device</h5>
                            <h3>
                              {data?.filter(
                                (item) =>
                                hasDeviceName(item) &&
                                isActiveStatus(
                                  item.SubscriptionStatus ??
                                    item.subscription_status
                                )
                              )?.length || 0}
                            </h3>
                          </div>
                          <div className="benefit-metric-icon">
                            <EventAvailableIcon fontSize="large" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              ) : (
                <h3 className="text-center mt-5 text-danger benefits-empty-state">
                  Your Staff Benefits Information will be shown here once you get
                  one
                </h3>
              )}

              {/* Plan Table */}
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
                    <div className="benefits-table-header">
                      <h6 className="summary-title mb-0">Current Contracts</h6>
                      {/* <Button
                        className="benefits-cta-btn"
                        onClick={handleOpen}
                      >
                        New Contract Application
                        <PostAddIcon size={16} />
                      </Button> */}
                    </div>
                    <div className="benefits-grid-wrap">
                      <DataGrid
                        autoHeight
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        checkboxSelection
                        disableSelectionOnClick
                        // onRowClick={handleRowClick}
                      />
                    </div>
                  </Box>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserBenefits;
