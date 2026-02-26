import React, { useEffect, useState, useRef } from "react";
import { Modal, Box, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Button from "react-bootstrap/Button";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import logo from "../../assets/Img/image 1.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import { addNotification } from "../../store/reducers/notificationReducer";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import "../../assets/style/global/voucher.css";
import UploadVoucher from "../../pages/admin/upload/UploadVoucher";
import UploadFileIcon from "@mui/icons-material/UploadFile";
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
const HandsetVoucher = ({ open, handleClose, userData, role }) => {
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contractData, setContractData] = useState(null);
  const [editedRows, setEditedRows] = useState(new Set());
  const modalRef = useRef();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null); // Initialize with null or appropriate initial value
  const [employeeCode, setEmployeeCode] = useState(
    userData?.EmployeeCode || ""
  );
  const [dataAllocation, setDataAllocation] = useState({});
  const devicePriceRef = useRef({});
    const [topupPayment, setTopupPayment] = useState(0); // Initial topupPayment
  const deviceNameRef = useRef({});
  const msisdnRef = useRef({});
  const upfrontPaymentRef = useRef({});
  const devicePriceRefCol6To8 = useRef({});
  const currentUser = useSelector((state) => state.auth.user);
  const [price, setPrice] = useState("");
  const [handset, setHandset] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenUpload = () => setModalOpen(true);
  const handleCloseUpload = () => setModalOpen(false);
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (e) => {
    setPrice(e.target.value);
  };
  useEffect(() => {
    const fetchDataAllocation = async () => {
      try {
        const response = await axiosInstance.get(
          `/handsets/allocations/${currentUser.AllocationID}`
        );
        // Assuming response.data is an object like { data: { HandsetAllocation: 8000, ... } }
        setDataAllocation(response.data.myAllocation);
        console.log("Fetched Allocation Data (response.data):", response.data);
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
  useEffect(() => {
  const calculateTopUpPayment = () => {
    const cleanPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    const allocation = parseFloat(dataAllocation.HandsetAllocation || 0);

    const newTopUpPayment =
      cleanPrice > allocation ? cleanPrice - allocation : 0;

    setTopupPayment(parseFloat(newTopUpPayment.toFixed(2)));
  };

  if (price && dataAllocation.HandsetAllocation) {
    calculateTopUpPayment();
  }
}, [price, dataAllocation.HandsetAllocation]);

  const handleBlur = () => {
    const numericValue = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericValue)) {
      setPrice(`N$${numericValue.toFixed(2)}`);
    } else {
      setPrice("");
    }
  };
  const handleHandsetSubmission = async () => {
    handleClose();
    if (!currentUser.EmployeeCode || !currentUser.AllocationID || !handset || topupPayment < 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please ensure Handset Name & Handset Price are provided and valid.",
      });
      setLoading(false);
      return; // Stop the function execution
    }

    try {
      setLoading(true);
      const payload = {
        EmployeeCode: currentUser.EmployeeCode,
        AllocationID: currentUser.AllocationID, // Assuming this is the numeric ID
        HandsetName: handset,
        HandsetPrice: price, // --- CRITICAL FIX: Send parsed numeric price ---
        AccessFeePaid: topupPayment, // Send the calculated excess (top-up)
        // FixedAssetCode: 'N/A', // Add if this is required and not from user input
        // CollectionDate: null,   // Add if these are to be handled later or are optional
        // RenewalDate: null,
        // status: 'Pending',      // Backend should set this as default
        // Add MSISDN and Upfront Payment if you collect them in the form
        // MSISDN: msisdn,
        // UpfrontPayment: upfrontPayment,
      };

      const response = await axiosInstance.post(
        `/handsets/`, // --- CRITICAL FIX: Correct API endpoint ---
        payload
      );

      // Assuming your backend responds with a success status (e.g., 201)
      // or a specific 'success' flag like { message: "...", handset: {...} }
      if (response.status === 201 || (response.data && response.data.handset)) { // Check for 201 status or presence of handset object
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Handset voucher successfully submitted!`, // Corrected typo
        });
        handleClose(); // Close the modal on success
        // Optionally, clear form fields here
        setHandset("");
        setPrice("");
        window.location.reload()
        // setMsisdn("");
        // setUpfrontPayment(0);
      } else {
        // Handle cases where status is not 201 but also not an error
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: `An unexpected error occurred: ${response.data?.message || 'Please verify details and try again.'}`,
        });
      }
    } catch (error) {
      console.error("Error submitting handset voucher:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: `Failed to submit voucher. Error: ${error.response?.data?.message || error.message || 'Please check your internet and try again.'}`,
      });
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Full height of viewport // Optional: background color for the page
        }}
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

          {/* Instructions */}
          <Box mt={3}>
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
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Handset Name"
                  value={handset}
                  onChange={(e) => setHandset(e.target.value)}
                />
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Price"
                  value={price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Box>
              {topupPayment > 0 && (
                <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Excess Payment"
                    value={topupPayment}
                    // I need to calculate the Excess paymnent
                  />
                </Box>
              )}

            </Box>
          </Box>

          {/* Employee Info */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              👤 Employee Details
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={currentUser.FullName}
                />
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Subledger Code (IFS)"
                  value={currentUser.EmployeeCode}
                />
              </Box>
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              onClick={handleHandsetSubmission}
              sx={{
                backgroundColor: "#0096D6",
                mr: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Submit Form
            </Button>
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

export default HandsetVoucher;
