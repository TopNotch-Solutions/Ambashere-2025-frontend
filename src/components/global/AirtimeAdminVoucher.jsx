import React, { useEffect, useState, useRef } from "react";
import { Modal, Box, useMediaQuery } from "@mui/material";
import Button from "react-bootstrap/Button"; // Keep if you use react-bootstrap buttons for Submit/Download
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

const AirtimeAdminVoucher = ({ open, handleClose, userData, role }) => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  // State for editable fields
  const [collectionDate, setCollectionDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [fixedAssetCode, setFixedAssetCode] = useState(""); // Initialize as empty string
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState(userData?.contracts?.ApprovalStatus);

  // State for read-only fields (initialized from userData or current user)
  const [handsetName, setHandsetName] = useState("");
  const [price, setPrice] = useState("");
  const [topupPayment, setTopupPayment] = useState(0);
  const [employeeFullName, setEmployeeFullName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [mrNumber, setMrNumber] = useState(""); // Initialize MR Number as empty string

  const [dataAllocation, setDataAllocation] = useState({});


  const [approvalStatus, setApprovalStatus] = useState(userData?.contracts?.ApprovalStatus);
  const [contractEndDate, setContractEndDate] = useState(userData?.contracts?.ContractEndDate);
  const [contractStartDate, setContractStartDate] = useState(userData?.contracts?.ContractStartDate);
  const [msisdn, setMsisdn] = useState(userData?.contracts?.MSISDN); 

  // State for Read-Only Fields (derived from userData or fixed)
  const [accountNumber, setAccountNumber] = useState(userData?.contracts?.AccountNumber || "");
  const [contractDuration, setContractDuration] = useState(userData?.contracts?.ContractDuration);
  const [contractNumber, setContractNumber] = useState(userData?.contracts?.ContractNumber );
  const [deviceMonthlyPrice, setDeviceMonthlyPrice] = useState(userData?.contracts?.DeviceMonthlyPrice);
  const [deviceName, setDeviceName] = useState(userData?.contracts?.DeviceName );
  const [devicePrice, setDevicePrice] = useState(userData?.contracts?.DevicePrice);
  const [employmentStatus, setEmploymentStatus] = useState(userData?.contracts?.EmploymentStatus);
  const [fullName, setFullName] = useState(userData?.contracts?.FullName);
  const [limitCheck, setLimitCheck] = useState(userData?.contracts?.LimitCheck);
  const [monthlyPayment, setMonthlyPayment] = useState(userData?.contracts?.MonthlyPayment);
  const [packageId, setPackageId] = useState(userData?.package?.PackageID );
  const [packageName, setPackageName] = useState(userData?.package?.PackageName );
  const [packagePrice, setPackagePrice] = useState(userData?.package?.MonthlyPrice );
  const [packagePaymentPeriod, setPackagePaymentPeriod] = useState(userData?.package?.PaymentPeriod );
  const [subscriptionStatus, setSubscriptionStatus] = useState(userData?.contracts?.SubscriptionStatus);
  const [upfrontPayment, setUpfrontPayment] = useState(userData?.contracts?.UpfrontPayment );
  const [createdAt, setCreatedAt] = useState(userData?.contracts?.createdAt );
  const [updatedAt, setUpdatedAt] = useState(userData?.contracts?.updatedAt);

  // Effect to set initial values when userData changes
  useEffect(() => {
    console.log("🔄 AirtimeAdminVoucher useEffect triggered with userData:", userData);
    
    // Check if userData exists and is not empty
    if (userData && Object.keys(userData).length > 0) {
      console.log("🔍 AirtimeAdminVoucher userData:", userData);
      console.log("🔍 userData.contracts:", userData.contracts);
      console.log("🔍 userData.package:", userData.package);
      
      // Handle both direct userData and nested contracts structure
      const contractData = userData.contracts || userData;
      const packageData = userData.package || {};
      
      console.log("🔍 contractData:", contractData);
      console.log("🔍 packageData:", packageData);
      console.log("🔍 DeviceName from contractData:", contractData.DeviceName);
      console.log("🔍 DevicePrice from contractData:", contractData.DevicePrice);
      
      setEmployeeFullName(contractData.FullName || "");
      setEmployeeCode(contractData.EmployeeCode || "");
      setHandsetName(contractData.DeviceName || ""); // Map DeviceName to Handset Name
      setPrice(contractData.DevicePrice || ""); // Map DevicePrice to Price
      
      // Update all other state values from contract data
      setDeviceName(contractData.DeviceName || "");
      setDevicePrice(contractData.DevicePrice || "");
      setDeviceMonthlyPrice(contractData.DeviceMonthlyPrice || "");
      setMsisdn(contractData.MSISDN || "");
      setContractNumber(contractData.ContractNumber || "");
      setContractDuration(contractData.ContractDuration || "");
      setMonthlyPayment(contractData.MonthlyPayment || "");
      setUpfrontPayment(contractData.UpfrontPayment || "");
      setSubscriptionStatus(contractData.SubscriptionStatus || "");
      setEmploymentStatus(contractData.EmploymentStatus || "");
      setFullName(contractData.FullName || "");
      setLimitCheck(contractData.LimitCheck || "");
      setAccountNumber(contractData.AccountNumber || "");
      
      // Update package data
      setPackageId(packageData.PackageID || "");
      setPackageName(packageData.PackageName || "");
      setPackagePrice(packageData.MonthlyPrice || "");
      setPackagePaymentPeriod(packageData.PaymentPeriod || "");
      
      console.log("✅ State updates completed");
      console.log("✅ handsetName set to:", contractData.DeviceName);
      console.log("✅ price set to:", contractData.DevicePrice);
      console.log("✅ deviceName set to:", contractData.DeviceName);
      console.log("✅ devicePrice set to:", contractData.DevicePrice);
      // FixedAssetCode is not directly in your API response.
      // You'll need to determine where this value should come from.
      // For now, it will remain empty unless you assign it.
      // setFixedAssetCode(userData.FixedAssetCode || "");

      // For MRNumber, you don't have a direct equivalent in the provided API data.
      // If MRNumber is derived or needs a default, handle that.
      // For now, it will remain as an empty string.
      // setMrNumber(userData.MRNumber || "");

      // Set Date fields, ensuring they are formatted correctly for input type="date" (YYYY-MM-DD)
      if (contractData.createdAt) {
        setRequestDate(new Date(contractData.createdAt).toISOString().split("T")[0]);
      }
      // Assuming CollectionDate and RenewalDate might be part of future updates to your contract object
      // For now, they'll remain empty unless you add them to your API response or derive them.
      // if (userData.CollectionDate) {
      //   setCollectionDate(new Date(userData.CollectionDate).toISOString().split("T")[0]);
      // }
      // if (userData.RenewalDate) {
      //   setRenewalDate(new Date(userData.RenewalDate).toISOString().split("T")[0]);
      // }
      // The status from your API is "ApprovalStatus"
      setStatus(userData?.contracts?.ApprovalStatus);
    }
  }, [userData]); // Depend on userData to re-run when it changes

  useEffect(() =>{
    if(upfrontPayment < 0) return
    if(upfrontPayment > devicePrice) return
    const newMonthlyPrice = (devicePrice - upfrontPayment) / packagePaymentPeriod;
    setDeviceMonthlyPrice(newMonthlyPrice);
    const newMonthlyPayment = newMonthlyPrice + packagePrice
    setMonthlyPayment(newMonthlyPayment)
  },[upfrontPayment]);

  useEffect(() =>{
    if(devicePrice < 0) return
    if(userData?.contracts?.DevicePrice !== devicePrice){
      const newMonthlyPayment = devicePrice / packagePaymentPeriod;

    setDeviceMonthlyPrice(newMonthlyPayment)
    }
  },[devicePrice])

  useEffect(() => {
    const fetchDataAllocation = async () => {
      try {
        // This API call seems to fetch handset allocation, not direct contract details
        // Ensure that `currentUser.AllocationID` is correctly defined and exists
        if (currentUser?.AllocationID) {
          const response = await axiosInstance.get(
            `/handsets/allocations/${currentUser.AllocationID}`
          );
          setDataAllocation(response.data.myAllocation);
        } else {
          console.warn("currentUser.AllocationID is not available for fetching allocation data.");
        }
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

    if (currentUser?.AllocationID) { // Only fetch if AllocationID exists
      fetchDataAllocation();
    }
  }, [dispatch, currentUser?.AllocationID]);


  // Calculate top-up payment based on DevicePrice and HandsetAllocation
  useEffect(() => {
    // Ensure both `price` and `dataAllocation.HandsetAllocation` are valid numbers
    const currentPrice = parseFloat(price);
    const allocation = parseFloat(dataAllocation.HandsetAllocation);

    if (!isNaN(currentPrice) && !isNaN(allocation)) {
      let newTopUpPayment = currentPrice >= allocation ? currentPrice - allocation : 0;
      setTopupPayment(parseFloat(newTopUpPayment.toFixed(2)));
    } else {
      setTopupPayment(0); // Default to 0 if values are invalid
    }
  }, [price, dataAllocation.HandsetAllocation]);

  // Handle form submission
  const handleSubmission = async () => {
    // In this context, userData is the contract itself, not nested under .handset
    // So, we use userData.ContractNumber as the ID
    if (userData?.contracts?.DevicePrice > 0) {
      if(devicePrice <= 0){
        handleClose();
        Swal.fire({
        icon: "error",
        title: "Equipment error",
        text: "Please enter equipment price",
      });
      return;
      }
    }


    // Prepare payload for update
    const payload = {
     PackagePrice: packagePrice,
     PackagePaymentPeriod: packagePaymentPeriod,
      UpfrontPayment: upfrontPayment,
       DevicePrice: devicePrice,
      ApprovalStatus: approvalStatus,
      DeviceMonthlyPrice: deviceMonthlyPrice,
      MSISDN: msisdn
    };

    console.log("Submitting payload:", payload);

    try {
      // Perform the PUT request to update the existing contract record
      // The endpoint should be for updating a contract, not a handset
      const response = await axiosInstance.put(
        `/contracts/update/${userData?.contracts?.ContractNumber}`, // Target the specific contract by ContractNumber
        payload
      );

      if (response.status === 200) {
        setHasChanges(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Contract ${userData.ContractNumber} successfully updated!`,
        });
        handleClose();
        window.location.reload(); // Reload the page to reflect changes
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
      console.error("Error updating contract:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: `Failed to update contract. Error: ${
          error.response?.data?.message ||
          error.message ||
          "Please check your internet and try again."
        }`,
      });
    }
  };

  const handleDownload = () => {
    window.print();
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
                Staff Service Plan
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
              <strong>Note:</strong> This document is only valid for the date and the time that it was printed and contains information, which is the property of MTC. No part of the document may be reproduced or transmitted in any form by any means, without written permission from MTC.
            </Alert>
          </Box>

          {/* Device Information */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              📱 Package Information
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Handset Name (DeviceName) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Package Name"
                  value={packageName} // Now maps to DeviceName from API
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
                    Package Name:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {packageName || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Price (DevicePrice) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Package Price"
                  value={packagePrice} // Now maps to DevicePrice from API
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
                    Package Price:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {packagePrice || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Excess Payment - Read-only */}
              <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Payment Period"
                    value={packagePaymentPeriod}
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
                      Payment Period:
                    </Typography>
                    <Typography variant="body1" className="print-text-field-value">
                      {packagePaymentPeriod || "."}
                    </Typography>
                  </Box>
                </Box>

                    
                    </Box>

              </Box>

          {/* Employee Info */}
          {
            deviceName !== "" || deviceName !== undefined && (
              <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              👤 Equipment Details
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Employee Name (FullName) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Equipment Name"
                  value={deviceName} // Now maps to FullName from API
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
                    Equipment Name:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {deviceName || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Subledger Code (IFS) (EmployeeCode) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Equipment Price"
                   type="number"
                  value={devicePrice} // Now maps to EmployeeCode from API
                  onChange={(e) => {
                      setDevicePrice(e.target.value);
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
                    Equipment Price:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {devicePrice || "."}
                  </Typography>
                </Box>
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Monthly Payment"
                  value={deviceMonthlyPrice} // Now maps to EmployeeCode from API
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
                    Montly Payment:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {deviceMonthlyPrice || "."}
                  </Typography>
                </Box>
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Upfront Payment"
                  value={upfrontPayment} // Now maps to EmployeeCode from API 
                  type="number"
                  onChange={(e) => {
                      setUpfrontPayment(e.target.value);
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
                    Upfront Payment:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {upfrontPayment || "."}
                  </Typography>
                </Box>
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="MSISD Number"
                  value={msisdn} // Now maps to EmployeeCode from API 
                  onChange={(e) => {
                      setMsisdn(e.target.value);
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
                    MSISD Numner:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {msisdn || "."}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
            )
          }
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              👤 Employee Details
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Employee Name (FullName) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={fullName} // Now maps to FullName from API
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
                    {fullName}
                  </Typography>
                </Box>
              </Box>

              {/* Subledger Code (IFS) (EmployeeCode) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Subledger Code (IFS)"
                  value={userData?.contracts?.EmployeeCode} // Now maps to EmployeeCode from API
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
                    {userData?.contracts?.EmployeeCode}
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

              {/* Date Requested (createdAt) - Read-only */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Contract Start Date"
                  value={contractStartDate} // Now maps to createdAt from API
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
                    Contract Start Date:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {contractStartDate || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Date Collected at HR - Editable (Currently not in API data, will be empty if not set) */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Contract End Date"
                  value={contractEndDate}
                  disabled
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
                    Contract End Date:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {contractEndDate || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Renewal Date (ContractEndDate) - Editable (Currently not in API data, will be empty if not set) */}
              <Box flex="1 1 48%">
                <TextField
                  fullWidth
                  label="Created Date"
                  type="date"
                  value={userData?.contracts?.createdAt} // Currently not in API data as ContractEndDate, adjust if it's meant to be editable
                  disabled={true} // Marked as disabled based on your original code
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
                    Created Date:
                  </Typography>
                  <Typography variant="body1" className="print-text-field-value">
                    {userData?.contracts?.createdAt || "."}
                  </Typography>
                </Box>
              </Box>

              {/* Status (ApprovalStatus) - Editable Select */}
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
                    value={approvalStatus} // Now maps to ApprovalStatus from API
                    label="Status"
                    onChange={(e) => {
                      setApprovalStatus(e.target.value);
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
              onClick={handleSubmission}
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

export default AirtimeAdminVoucher;