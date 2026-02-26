import React, { useEffect, useState, useRef } from "react";
import { Modal, Box, useMediaQuery } from "@mui/material";
import Button from "react-bootstrap/Button";
import { useTheme } from "@emotion/react";
import logo from "../../assets/Img/image 1.png";
import Swal from "sweetalert2";
import { addNotification } from "../../store/reducers/notificationReducer";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import "../../assets/style/global/voucher.css";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { CancelPresentation as CancelPresentationIcon } from "@mui/icons-material";

const HandsetAdminVoucher = ({ open, handleClose, userData, role }) => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  // State for editable fields
  const [collectionDate, setCollectionDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState(""); // Assuming 'Pending' is default or comes from userData
  
  // Fixed Asset Code is read-only, comes from userData
  const fixedAssetCode = userData?.handset?.FixedAssetCode || null;

  // State for read-only fields (initialized from userData or current user)
  const [handsetName, setHandsetName] = useState(
    userData?.handset?.HandsetName || ""
  );
  const [price, setPrice] = useState(userData?.handset?.HandsetPrice || "");
  const [topupPayment, setTopupPayment] = useState(0); // Initial topupPayment
  const [employeeFullName, setEmployeeFullName] = useState(
    currentUser?.FullName || ""
  );
  const [employeeCode, setEmployeeCode] = useState(
    currentUser?.EmployeeCode || ""
  );
  const [requestDate, setRequestDate] = useState(
    userData?.handset?.RequestDate
      ? new Date(userData.handset.RequestDate).toLocaleDateString("en-CA")
      : ""
  ); // Format for input type="date"
  const [mrNumber, setMrNumber] = useState(
    userData?.handset?.MRNumber
  ); // Initialize MR Number

  const [dataAllocation, setDataAllocation] = useState({});

  // Effect to set initial values when userData changes
  useEffect(() => {
    if (userData?.handset) {
      setEmployeeFullName(userData.employee.FullName || "");
      setEmployeeCode(userData.employee.EmployeeCode || "");
      setHandsetName(userData.handset.HandsetName || "");
      setPrice(userData.handset.DevicePrice || "");
      setMrNumber(userData.handset.MRNumber || ""); // Set MR Number from userData
      // Set RequestDate, CollectionDate, RenewalDate if they exist in userData
      if (userData.handset.RequestDate) {
        setRequestDate(
          new Date(userData.handset.RequestDate).toLocaleDateString("en-CA")
        );
      }
      if (userData.handset.CollectionDate) {
        setCollectionDate(
          new Date(userData.handset.CollectionDate).toLocaleDateString("en-CA")
        );
      }
      if (userData.handset.RenewalDate) {
        setRenewalDate(
          new Date(userData.handset.RenewalDate).toLocaleDateString("en-CA")
        );
      }
      setStatus(userData.handset.status);
    }
   
  }, [userData, currentUser]);

  useEffect(() => {
    const fetchDataAllocation = async () => {
      try {
        const response = await axiosInstance.get(
          `/handsets/allocations/${currentUser.AllocationID}`
        );
        setDataAllocation(response.data.myAllocation);
      } catch (error) {
        console.error("Error fetching allocation data:", error);
        dispatch(
          addNotification({
            message: "Failed to load handset allocation data.",
            type: "error",
          })
        );
      }
    };

    if (currentUser?.AllocationID) {
      fetchDataAllocation();
    }
  }, [dispatch, currentUser?.AllocationID]);

  // Calculate top-up payment based on HandsetPrice and Allocation
  useEffect(() => {
    let newTopUpPayment =
      parseFloat(price) >= dataAllocation.HandsetAllocation
        ? parseFloat(price) - dataAllocation.HandsetAllocation
        : 0;
    newTopUpPayment = parseFloat(newTopUpPayment.toFixed(2));
    setTopupPayment(newTopUpPayment);
  }, [price, dataAllocation.HandsetAllocation]);

  // Handle form submission
  const handleHandsetSubmission = async () => {
    // In an "update-only" scenario, we must ensure an existing handset record is being targeted.
    // If userData.handset.id is not present, it indicates a critical issue
    // as this form is not designed for creating new entries.
    if (!userData?.handset?.id) {
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: "Cannot update: No existing handset record identified. This form is for updates only.",
      });
      return; // Stop the function execution if no ID is found
    }

    // --- Validation for Update ---
    // For an update, we assume core read-only fields (HandsetName, Price, MR Number, Request Date, Employee Code, Allocation ID)
    // were already set during creation and are just being displayed.
    // We primarily focus on ensuring the identifying fields are still present in state
    // (as they should have been populated from userData) and that editable fields are valid if changed.
    console.log("Here is the current handset id: ",userData?.handset?.id)
    if (
      !employeeCode ||
      !currentUser.AllocationID ||
      !handsetName ||
      !price ||
      !requestDate
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Core handset details must be available to perform an update. Please refresh if this data is missing.",
      });
      return;
    }
    const formatDateForSubmission = (dateString) => {
    if (!dateString) return null; // Handle empty string or null directly

    const date = new Date(dateString);
    // Check if the date is valid before converting to ISO string
    return isNaN(date.getTime()) ? null : date.toISOString();
  };

    // Prepare payload for update
    const payload = {
      EmployeeCode: employeeCode, // Should come from currentUser, read-only // Read-only, calculated
      MRNumber: mrNumber, // Read-only
      CollectionDate: formatDateForSubmission(collectionDate), // Editable
      status: status, 
    };

    try {
      // Perform the PUT request to update the existing handset record
      const response = await axiosInstance.put(
        `/handsets/${userData.handset.id}`, // Target the specific record by ID
        payload
      );

      if (response.status === 200) {
        setHasChanges(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Handset voucher successfully updated!`,
        });
        handleClose();
        window.location.reload()
        // Optionally, reset editable fields to their new state or clear if the modal closes.
        // For an update form, usually you'd just close it and let the parent re-fetch data.
      } else {
        handleClose();
        setHasChanges(false);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: `An unexpected error occurred: ${
            response.data?.message || "Please verify details and try again."
          }`,
        });
      }
    } catch (error) {
      handleClose();
      setHasChanges(false);
      console.error("Error updating handset voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: `Failed to update voucher. Error: ${
          error.response?.data?.message ||
          error.message ||
          "Please check your internet and try again."
        }`,
      });
    }
  };


  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          "@media print": {
            display: "block",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            minHeight: "auto",
            height: "auto",
            margin: 0,
            padding: 0,
          },
        }}
        id="printable-form"
      >
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "16px",
            width: isMediumScreen ? "90%" : "65%",
            margin: "4vh auto",
            overflowY: "auto",
            boxShadow: 6,
            maxHeight: "90vh",
            p: 4,
            "@media print": {
              boxShadow: "none",
              overflow: "visible",
              maxHeight: "none",
              width: "100%",
              height: "auto",
              margin: "auto",
              padding: 4,
              borderRadius: "16px",
            },
          }}
        >
          {/* Header Branding */}
          <Box
            sx={{
              background: "linear-gradient(90deg, #0096D6, #0078A8)",
              borderRadius: "12px",
              p: 3,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "@media print": {
                padding: 3,
                borderRadius: "12px",
                "-webkit-print-color-adjust": "exact",
                "print-color-adjust": "exact",
              },
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Staff Handset Form
              </Typography>
            </Box>
            <img
              src={logo}
              alt="MTC Logo"
              height="50"
              style={{ objectFit: "contain" }}
            />
          </Box>

          {/* Instructions - Hide on print */}
          <Box
            mt={3}
            sx={{
              display: "block",
              "@media print": {
                display: "none",
              },
            }}
          >
            <Alert severity="info">
              <strong>Note:</strong> This form is maintained daily by the{" "}
              <b>HR Administrator</b> and forwarded to{" "}
              <b>Finance, Asset Department</b> for ledger updates.
            </Alert>
          </Box>

          {/* Device Information */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              📱 Device Information
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Handset Name - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Handset Name"
                  value={handsetName}
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Handset Name:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {handsetName || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Price - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Price"
                  value={price}
                  type="number"
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Price:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {price || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Excess Payment - Read-only */}
              {topupPayment > 0 && (
                <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Excess Payment"
                    value={topupPayment}
                    disabled // Make read-only
                    className="print-hidden"
                    sx={{
                      display: "block",
                      "@media print": {
                        display: "none",
                      },
                    }}
                  />
                  <Box
                    className="print-text-field-display show-on-print"
                    sx={{
                      display: "none",
                      "@media print": {
                        display: "block",
                      },
                    }}
                  >
                    <Typography variant="body2" className="print-text-field-label">
                      Excess Payment:
                    </Typography>
                    <Typography variant="body1" className="print-text-field-value">
                      {topupPayment || "."}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* MR Number - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="MR Number"
                  value={mrNumber}
                  onChange={(e) => {
                    setMrNumber(e.target.value);
                    setHasChanges(true);
                  }}
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    MR Number:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {mrNumber || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Date Created (RequestDate) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Date Created"
                  value={requestDate}
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Date Created:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {requestDate|| "."}
                  </Typography>
                </Box>
              </Box>

              {/* Fixed Asset Code - Read-only field, assigned by Finance team only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Fixed Asset Code"
                  value={fixedAssetCode || "Not Assigned"} 
                  InputProps={{
                    readOnly: true,
                  }}
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                    "& .MuiInputBase-input": {
                      color: fixedAssetCode ? 'text.primary' : 'text.secondary',
                      fontStyle: fixedAssetCode ? 'normal' : 'italic'
                    }
                  }}
                  helperText="Assigned by Finance team only"
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Fixed Asset Code:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {fixedAssetCode || "Not Assigned"} 
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Employee Info */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              👤 Employee Details
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Employee Name - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={employeeFullName}
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Employee Name:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {employeeFullName}
                  </Typography>
                </Box>
              </Box>

              {/* Subledger Code (IFS) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Subledger Code (IFS)"
                  value={employeeCode}
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Subledger Code (IFS):
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {employeeCode}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Status Info */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              📦 Tracking & Collection
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">

              {/* Date Requested - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Date Requested"
                  value={requestDate}
                  disabled // Make read-only
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Date Requested:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {requestDate}
                  </Typography>
                </Box>
              </Box>

              {/* Date Collected at HR - Editable */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Date Collected at HR"
                  type="date" // Use date type for date input
                  value={collectionDate}
                  onChange={(e) => {
                    setCollectionDate(e.target.value);
                    setHasChanges(true);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Date Collected at HR:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {collectionDate || "."}
                  </Typography>{" "}
                  {/* Display empty string or placeholder for empty value */}
                </Box>
              </Box>

              {/* Date Returned to HR (RenewalDate) - Editable */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Renewal Date" // Changed label to Renewal Date based on model
                  type="date" // Use date type for date input
                  value={renewalDate}
                  disabled
                  onChange={(e) => {
                    setRenewalDate(e.target.value);
                    setHasChanges(true);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className="print-hidden"
                  sx={{
                    display: "block",
                    "@media print": {
                      display: "none",
                    },
                  }}
                />
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Renewal Date:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {renewalDate || "."}
                  </Typography>{" "}
                  {/* Display empty string or placeholder for empty value */}
                </Box>
              </Box>

              {/* Status - Editable Select */}
              <Box flex="1 1 48%">
                <FormControl
                  fullWidth
                  className="print-hidden"
                  sx={{
                    display: "flex",
                    "@media print": {
                      display: "none",
                    },
                  }}
                >
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="Status"
                    disabled={status === "Approved"}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setHasChanges(true);
                    }}
                  >
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <Box
                  className="print-text-field-display show-on-print"
                  sx={{
                    display: "none",
                    "@media print": {
                      display: "block",
                    },
                  }}
                >
                  <Typography variant="body2" className="print-text-field-label">
                    Status:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {status}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <>
            {/* Approval Table - Show only on print */}
            <Box
              mt={4}
              sx={{
                display: "none",
                "@media print": {
                  display: "block",
                },
              }}
            >
              <Typography
                variant="h6"
                align="center"
                sx={{
                  display: "block",
                  "@media print": {
                    display: "none",
                  },
                }}
              >
                🔏 Approvals
              </Typography>
              <table
                className="table table-bordered mt-3"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Name</th>
                    <th>Signature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>HR Admin</td>
                    <td>Johanna Kavendji</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>MH Supervisor</td>
                    <td>Eric Williams</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Key Account Executive</td>
                    <td>Theo Ishuna</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>AR Supervisor</td>
                    <td>Drummond Kazong</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* Final Section - Show only on print */}
            <Box
              mt={5}
              textAlign="center"
              sx={{
                display: "none",
                "@media print": {
                  display: "block",
                },
              }}
            >
              <Typography variant="h6" color="error">
                IMPORTANT!!
              </Typography>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: 40,
                  textAlign: "left",
                }}
              >
                <li>AR must return signed voucher to HR:Admin.</li>
                <li>
                  All control points must scan and upload signed vouchers to the
                  order system.
                </li>
                <li>
                  Receipts for excess payments must be scanned and attached in
                  Siebel.
                </li>
              </ul>
            </Box>
          </>

          {/* Footer Actions - Hide on print */}
          <Box mt={4} textAlign="right" className="hide-on-print">

            {/* Submit Button (Green) */}
            <Button
              variant="contained"
              onClick={handleHandsetSubmission}
              disabled={!hasChanges}
              disableElevation
              sx={{
                backgroundColor: "#2e7d32",
                color: "white",
                mr: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#1b5e20",
                },
              }}
            >
              Submit Form
            </Button>

            {/* Cancel Button (Red) */}
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelPresentationIcon />}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default HandsetAdminVoucher;