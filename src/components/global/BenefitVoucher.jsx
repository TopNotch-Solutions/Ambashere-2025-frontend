import React, { useEffect, useState, useRef } from "react";
import { Modal, Box, CircularProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Button from "react-bootstrap/Button";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import {
  CancelPresentation as CancelPresentationIcon,
  SaveAlt as SaveAltIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import { addNotification } from "../../store/reducers/notificationReducer";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import "../../assets/style/global/voucher.css";
import UploadVoucher from "../../pages/admin/upload/UploadVoucher";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const BenefitVoucher = ({ open, handleClose, role }) => {
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const colors = tokens(theme.palette.mode);
  const [contractData, setContractData] = useState(null);
  const [editedRows, setEditedRows] = useState(new Set());
  const modalRef = useRef();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const [selectedContract, setSelectedContract] = useState(null); // Initialize with null or appropriate initial value
  const [employeeCode, setEmployeeCode] = useState(
    userData?.EmployeeCode || ""
  );
  const devicePriceRef = useRef({});
  const deviceNameRef = useRef({});
  const msisdnRef = useRef({});
  const upfrontPaymentRef = useRef({});
  const devicePriceRefCol6To8 = useRef({});

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenUpload = () => setModalOpen(true);
  const handleCloseUpload = () => setModalOpen(false);
  const [withinLimit, setWithinLimit] = useState(null);

  useEffect(() => {
    const handle = async () => {
      try {
        setIsUserDataLoading(true);
        const response = await axiosInstance.get(
          `/staffmember/allocation/${currentUser.EmployeeCode}`
        );
        // console.log("Response data:", response.data); // Log the response to inspect its structure
        if (response.status === 200) {
          setUserData(response.data); // Assuming you want the first element in the array
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsUserDataLoading(false);
      }
    };
    if (open && currentUser?.EmployeeCode) {
      handle();
    } else if (!open) {
      // Reset data when modal closes
      setUserData(null);
      setRows([]);
      setWithinLimit(null);
    }
  }, [open, currentUser?.EmployeeCode]);
  useEffect(() => {
    console.log("My current user dataaaaaaaaaaaa: ", userData);
    if (
      userData &&
      userData.staffWithAirtimeAllocation &&
      userData.staffWithAirtimeAllocation.length > 0
    ) {
      console.log(
        "Gghhggh: ",
        userData.staffWithAirtimeAllocation[0]?.EmployeeCode
      );
      setEmployeeCode(userData.staffWithAirtimeAllocation[0]?.EmployeeCode);
    } else {
      // Optional: Log what userData looks like if it doesn't meet the conditions
      console.log(
        "userData or staffWithAirtimeAllocation is not fully loaded/empty:",
        userData
      );
    }
  }, [userData]);

  const [devicePrices, setDevicePrices] = useState({
    6: "",
    7: "",
    8: "",
  });

  const currentDate = new Date().toISOString().split("T")[0];

  // Fetch package details from database and populate the dropdown containing package info
  useEffect(() => {
    const fetchDropdownValuesFromDatabase = async () => {
      try {
        console.log("🔄 BenefitVoucher: Fetching packages from /packages/packageList...");
        const response = await axiosInstance.get(`/packages/packageList?t=${Date.now()}`);
        if (response.status < 200 || response.status >= 300) {
          throw new Error("Failed to fetch dropdown values");
        }

        const data = response.data;
        console.log("📦 BenefitVoucher: Packages response:", data);
        console.log("📊 BenefitVoucher: Total packages received:", data.length);

        // Add "Select Package" option if it's not in the data
        const dropdownOptions = data.some(
          (option) => option.PackageName === "Select Package"
        )
          ? data
          : [{ PackageName: "Select Package" }, ...data];

        console.log("📋 BenefitVoucher: Dropdown options:", dropdownOptions.length);
        setDropdownOptions(dropdownOptions);
      } catch (error) {
        console.error("❌ BenefitVoucher: Error fetching dropdown values:", error);
        console.error("Error details:", error.response?.data);
      }
    };

    fetchDropdownValuesFromDatabase();
  }, []);

  // Download function for the contract
  const handleDownloadPDF = async () => {
    const input = modalRef.current;

    // Create a temporary off-screen element
    const offScreenElement = input.cloneNode(true);
    offScreenElement.style.position = "absolute";
    offScreenElement.style.left = "-9999px";
    offScreenElement.style.top = "0";
    offScreenElement.style.maxHeight = "none";
    offScreenElement.style.overflow = "visible";
    offScreenElement.style.backgroundColor = "white"; // Ensure background is white

    // Exclude buttons
    const buttons = offScreenElement.querySelectorAll("button");
    buttons.forEach((button) => (button.style.display = "none"));

    document.body.appendChild(offScreenElement);

    // Wait for fonts and other resources to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Ensure the clone has the correct dimensions and styles
    const originalWidth = input.offsetWidth;
    const originalHeight = input.scrollHeight;
    offScreenElement.style.width = `${originalWidth}px`;
    offScreenElement.style.height = `${originalHeight}px`;

    html2canvas(offScreenElement, { useCORS: true, backgroundColor: "white" })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("voucher.pdf");
      })
      .finally(() => {
        // Remove the temporary off-screen element
        document.body.removeChild(offScreenElement);
      });
  };

  // Initialize rows with user data when both are available
  useEffect(() => {
    if (userData && dropdownOptions.length > 0 && rows.length === 0) {
      // Initialize the first five rows
      const initialRows = Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        dropdown: "Select Package",
        column2: "",
        column3: "",
        column4: "",
        column5: "",
        column6: "Select Type",
      }));

      // Static rows definition
      const staticRows = [
        {
          id: 6,
          dropdown: "Equipment Plan",
          column2: "",
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 7,
          dropdown: "Equipment Plan",
          column2: "",
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 8,
          dropdown: "Equipment Plan",
          column2: "",
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 9,
          dropdown: "Name of Employee:",
          column2: userData.staffWithAirtimeAllocation[0].FullName,
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 10,
          dropdown: "Name of Employee Sub-ledger:",
          column2: userData.staffWithAirtimeAllocation[0].EmployeeCode,
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 11,
          dropdown: "Service Account/ MSISDN",
          column2: userData.staffWithAirtimeAllocation[0].ServicePlan === "Postpaid" 
            ? "POST: " + userData.staffWithAirtimeAllocation[0].PhoneNumber 
            : "",
          column3: userData.staffWithAirtimeAllocation[0].ServicePlan === "Prepaid" 
            ? "PRE: " + userData.staffWithAirtimeAllocation[0].PhoneNumber 
            : "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 12,
          dropdown: "Qualifying Allowance/ MUL",
          column2: userData.staffWithAirtimeAllocation[0].AirtimeAllocation,
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 13,
          dropdown: "Current Available Allowance/ MUL",
          column2: userData.available,
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
        {
          id: 14,
          dropdown: "New Allowance/ MUL",
          column2: "",
          column3: "",
          column4: "30% Limit Check",
          column5: "",
          column6: "",
        },
        {
          id: 15,
          dropdown: "Service ID/ Order No:",
          column2: "",
          column3: "",
          column4: "",
          column5: "",
          column6: "",
        },
      ];

      // Combine initial and static rows
      setRows([...initialRows, ...staticRows]);
    }
  }, [userData, dropdownOptions.length]);

  // Pre-fill information for existing rows
  useEffect(() => {
    if (userData && rows.length > 0) {
      const updatedRows = rows.map((row) => {
        switch (row.id) {
          case 9:
            return {
              ...row,
              column2: userData.staffWithAirtimeAllocation[0].FullName,
            };
          case 10:
            return {
              ...row,
              column2: userData.staffWithAirtimeAllocation[0].EmployeeCode,
            };
          case 11:
            return userData.staffWithAirtimeAllocation[0].ServicePlan ===
              "Postpaid"
              ? {
                  ...row,
                  column2:
                    "POST: " +
                    userData.staffWithAirtimeAllocation[0].PhoneNumber,
                }
              : {
                  ...row,
                  column3:
                    "PRE: " +
                    userData.staffWithAirtimeAllocation[0].PhoneNumber,
                };
          case 12:
            return {
              ...row,
              column2: userData.staffWithAirtimeAllocation[0].AirtimeAllocation,
            };
          case 13:
            return { ...row, column2: userData.available };
          default:
            return row;
        }
      });
      setRows(updatedRows);
    }
  }, [userData]);

  // Handle change in inputs
  const handleInputChange = (event, id, field) => {
    const { value } = event.target;

    if (field === "column2") {
      if (devicePriceRef.current && devicePriceRef.current[id]) {
        devicePriceRef.current[id].value = value;
      }

      // Update the state of devicePrices based on the updated input
      setDevicePrices((prevDevicePrices) => ({
        ...prevDevicePrices,
        [id]: parseFloat(value) || 0,
      }));

      // Update rows first, then calculateMUL will be called via useEffect
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, column2: value } : row
        )
      );
    } else if (field === "column3") {
      if (deviceNameRef.current && deviceNameRef.current[id]) {
        deviceNameRef.current[id].value = value;
      }
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, column3: value } : row
        )
      );
    } else if (field === "column4") {
      if (msisdnRef.current && msisdnRef.current[id]) {
        msisdnRef.current[id].value = value;
      }
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, column4: value } : row
        )
      );
    } else if (field === "column5") {
      if (upfrontPaymentRef.current && upfrontPaymentRef.current[id]) {
        upfrontPaymentRef.current[id].value = value;
      }
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, column5: value } : row
        )
      );
    }
  };

  // Handle Dropdown changes
  const handleDropdownChange = (event, rowId, field) => {
    const { value } = event.target;

    if (field === "dropdown") {
      if (value === "Select Package") {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === rowId
              ? { ...row, dropdown: "", column2: "", packageID: null }
              : row
          )
        );
      } else {
        const selectedOption = dropdownOptions.find(
          (option) => option.PackageName === value
        );
        if (selectedOption) {
          const price = selectedOption.MonthlyPrice;
          const packageID = selectedOption.PackageID;

          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === rowId
                ? { ...row, dropdown: value, column2: `${price}`, packageID }
                : row
            )
          );
        }
      }
    } else if (field === "column6") {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, column6: value } : row
        )
      );
    }
  };

  const calculateMUL = (updatedRows) => {
    // Guard clause: Don't calculate if userData is not available
    if (!userData || !userData.available) {
      console.log("calculateMUL: userData not available, skipping calculation");
      return updatedRows;
    }

    // Calculate the sum of column2 values for rows with id between 1 and 8
    const sumColumn2 = updatedRows.reduce((sum, row) => {
      if (row.id >= 1 && row.id <= 8) {
        // Add device price for rows 6 to 8 into sumColumn2 calculation
        // Ensure devicePriceRefCol6To8.current[row.id] exists and has a value property
        if (row.id >= 6 && row.id <= 8) {
          return (
            sum +
            parseFloat(row.column2 || 0) +
            parseFloat(
              devicePriceRefCol6To8.current &&
                devicePriceRefCol6To8.current[row.id]
                ? devicePriceRefCol6To8.current[row.id].value || 0
                : 0
            )
          );
        }
        return sum + parseFloat(row.column2 || 0);
      }
      return sum;
    }, 0);

    // Calculate the sum of column5 values for rows with id between 6 and 8
    const sumColumn5 = updatedRows.reduce((sum, row) => {
      if (row.id >= 6 && row.id <= 8) {
        return sum + parseFloat(row.column5 || 0);
      }
      return sum;
    }, 0);

    // IMPORTANT: The user states `userData?.available` is the current available amount.
    // We will use this as the base for calculating the new allowance.
    const baseAvailableAmount = parseFloat(userData.available);

    // Calculate the new allowance: User's available amount minus total costs
    const newAllowance = baseAvailableAmount - (sumColumn2 + sumColumn5);

    // --- NEW LIMIT CHECK LOGIC ---
    // The limit is that the newAllowance (remaining available amount) should not go below 0.
    // If newAllowance is 0 or positive, it's within the limit.
    // If newAllowance is negative, it's exceeding the limit.
    let isWithinLimit = newAllowance >= 0;

    // Update the component's state for 'withinLimit' (this update is asynchronous)
    setWithinLimit(isWithinLimit);

    // Console logs for debugging the new logic
    console.log("--- calculateMUL Debugging ---");
    console.log(
      "Base Available Amount (userData?.available):",
      baseAvailableAmount
    );
    console.log("Sum Column 2 (Packages & Devices):", sumColumn2);
    console.log("Sum Column 5 (Device Upfront/Other Costs):", sumColumn5);
    console.log("Total Costs:", sumColumn2 + sumColumn5);
    console.log("New Allowance (Remaining):", newAllowance);
    console.log("Is Within Limit (newAllowance >= 0):", isWithinLimit);
    console.log("--- End calculateMUL Debugging ---");

    // Update the rows with the new allowance and limit check status
    return updatedRows.map((row) => {
      if (row.id === 14) {
        return {
          ...row,
          column2: newAllowance, // Display the calculated newAllowance
          // Use the locally calculated `isWithinLimit` for immediate update
          column5: isWithinLimit ? "Within limit" : "Exceeding limit",
        };
      }
      return row;
    });
  };

  useEffect(() => {
    // Only calculate if userData is available and not loading
    if (userData && !isUserDataLoading) {
      const updatedRows = calculateMUL(rows);
      console.log("Within Limit: ", withinLimit);
      if (JSON.stringify(updatedRows) !== JSON.stringify(rows)) {
        setRows(updatedRows);
      }
    }
  }, [rows, withinLimit, userData, isUserDataLoading]);

  const isCellEditable = (params) => {
    const { id, field } = params;
    if (role === 1 && (field === "MSISDN" || field === "FixedAssetCode")) {
      return true; // Admins can edit MSISDN and FixedAssetCode
    }
    if (role === 3 && id !== 11 && id !== 10) {
      return true; // Users can edit all cells except MSISDN and FixedAssetCode
    }
    return false;
  };

  // Fetch contract data for admin
  const handleSave = async () => {
    // --- 1. Initial Limit Check (remains first) ---
    if (!withinLimit) {
      handleClose();
      Swal.fire({
        icon: "error",
        title: "Limit Exceeded",
        text: "The new allowance is not within the allowed limit (70% of Airtime Allocation).",
      });
      return;
    }

    try {
      console.log("handleSave function called");
      console.log("Rows data at the start of handleSave:", rows);

      // --- 2. Basic Form Data Check ---
      if (!rows || rows.length === 0) {
        handleClose();
        throw new Error("Form data is empty. Please fill in the form.");
      }

      // --- 3. Validate and Aggregate Selected Packages (Rows 1-5) ---
      const selectedPackagesDetails = [];
      const packageRows = rows.filter((row) => row.id >= 1 && row.id <= 5); // Get all potential package rows

      for (const packageRow of packageRows) {
        // Check if a package is actually selected in this row (column2 has a value)
        if (packageRow.column2) {
          // Validate subscription type for this selected package
          if (!packageRow.column6 || packageRow.column6 === "Select Type") {
            handleClose();
            const packageName =
              packageRow.dropdown && packageRow.dropdown !== "Select Package"
                ? `for Package: ${packageRow.dropdown}`
                : `in row ${packageRow.id}`;
            throw new Error(
              `Please select a valid subscription type ${packageName}. 'Select Type' is not allowed.`
            );
          }

          const contractDurationMatch = packageRow.dropdown.match(/\d+/);
          if (!contractDurationMatch) {
            handleClose();
            throw new Error(
              `Invalid package format for ${
                packageRow.dropdown || `row ${packageRow.id}`
              }. Could not extract contract duration.`
            );
          }
          const contractDuration = parseInt(contractDurationMatch[0], 10);
          const monthlyPrice = parseFloat(packageRow.column2); // Base monthly price from column2

          selectedPackagesDetails.push({
            id: packageRow.id, // Keep the row ID to link with devices
            PackageID: packageRow.packageID,
            BaseMonthlyPrice: monthlyPrice, // Store original monthly price
            SubscriptionStatus: packageRow.column6,
            ContractDuration: contractDuration,
            DisplayName: packageRow.dropdown, // For better error messages/display
            DeviceAssigned: null, // Placeholder for device assignment
            AdjustedMonthlyPrice: monthlyPrice, // Will be updated if a device is linked
          });
        }
      }

      // Ensure at least one package was selected
      if (selectedPackagesDetails.length === 0) {
        handleClose();
        throw new Error(
          "Please select at least one package from the first five rows."
        );
      }

      // --- 4. Validate and Aggregate Device Details (Rows 6-8) ---
      const selectedDevicesDetails = [];
      // deviceNameRef.current is likely an array-like object where index 6, 7, 8 refer to rows.
      // Ensure all refs are properly initialized and accessible.
      const deviceRefs = [
        deviceNameRef.current[6],
        deviceNameRef.current[7],
        deviceNameRef.current[8],
      ];
      const devicePriceRefs = [
        devicePriceRef.current[6],
        devicePriceRef.current[7],
        devicePriceRef.current[8],
      ];

      for (let i = 0; i < 3; i++) {
        const deviceIdx = 6 + i; // Corresponds to row IDs 6, 7, 8
        const currentDeviceNameInput = deviceRefs[i];
        const currentDevicePriceInput = devicePriceRefs[i];

        const deviceName = currentDeviceNameInput?.value || "";
        let devicePrice = parseFloat(currentDevicePriceInput?.value);

        // Only add device if a name or a non-zero price is provided
        if (deviceName || (!isNaN(devicePrice) && devicePrice > 0)) {
          if (isNaN(devicePrice) || devicePrice <= 0) {
            handleClose();
            throw new Error(
              `Device price for ${
                deviceName || `device in row ${deviceIdx}`
              } must be a positive number.`
            );
          }
          selectedDevicesDetails.push({
            id: deviceIdx, // Row ID of the device
            DeviceName: deviceName,
            DevicePrice: devicePrice,
            // Upfront payment might be handled globally or per device, clarify if per device
            UpfrontPayment:
              parseFloat(upfrontPaymentRef.current[deviceIdx]?.value) || 0, // Assuming upfront for each device is in its row's ref
          });
        }
      }

      // --- 5. Assign Devices to Packages and Adjust Prices ---
      selectedPackagesDetails.forEach((packageDet, index) => {
        // Assign device if available at the corresponding index (0-indexed for devices, 0-indexed for packages)
        if (selectedDevicesDetails[index]) {
          const device = selectedDevicesDetails[index];
          const monthlyDeviceCost =
            device.DevicePrice / packageDet.ContractDuration;

          packageDet.DeviceAssigned = {
            DeviceName: device.DeviceName,
            DevicePrice: device.DevicePrice,
            UpfrontPayment: device.UpfrontPayment,
            MonthlyDeviceCost: monthlyDeviceCost,
          };
          packageDet.AdjustedMonthlyPrice += monthlyDeviceCost;
        }
      });

      // --- 6. Extract Other Global Details ---
      const employeeCode = rows.find((row) => row.id === 10)?.column2;
      if (!employeeCode) {
        handleClose();
        throw new Error(
          "Employee code is missing. Please enter an employee code."
        );
      }

      let msisdn = "";
      if (role === 1) {
        // Admin role check for MSISDN
        msisdn =
          rows.find((row) => row.id === 11)?.column2 ||
          rows.find((row) => row.id === 11)?.column3;
        if (!msisdn) {
          handleClose();
          throw new Error("MSISDN is missing. Admin must fill this field.");
        }
      }

      const updatedRows = calculateMUL(rows); // `rows` should contain the latest user inputs
      const currentAllowance = parseFloat(
        updatedRows.find((row) => row.id === 12)?.column2 || 0
      );
      const newAllowance = parseFloat(
        updatedRows.find((row) => row.id === 14)?.column2 || 0
      ); // Row 14 for New Allowance
      const limitCheckStatus = updatedRows.find(
        (row) => row.id === 14
      )?.column5; // Row 14 for Limit Check Status

      // Calculate total monthly payment across all selected packages + currentAllowance - newAllowance
      const totalPackagesMonthlyCost = selectedPackagesDetails.reduce(
        (sum, pkg) => sum + pkg.AdjustedMonthlyPrice,
        0
      );
      console.log("Total packages monthly cost: ", totalPackagesMonthlyCost);
      console.log(userData.available - totalPackagesMonthlyCost);
      if (userData.available - totalPackagesMonthlyCost < 0) {
        handleClose();
        Swal.fire({
          icon: "error",
          title: "Cost Limit Exceeded",
          text: `The total monthly cost for packages and equipment plan exceeds the allowed limit (${userData.staffWithAirtimeAllocation[0].AirtimeAllocation.toFixed(
            2
          )}).`,
        }).then((result) => {
          // Check if the user clicked the "OK" button (which is 'isConfirmed' by default)
          if (result.isConfirmed) {
            window.location.reload(); // Reload the page
          }
        });
        return;
      }
      const monthlyPayment = currentAllowance - newAllowance;

      // --- 8. Construct Final `contractData` Payload ---
      const contractData = {
        EmployeeCode: employeeCode,
        MonthlyPayment: monthlyPayment, // Overall calculated payment (from allowances)
        LimitCheck: limitCheckStatus, // "Within limit" or "Exceeding limit"
        ApprovalStatus: "Pending",
        ContractStartDate: new Date().toISOString().split("T")[0],
        ContractEndDate: "", // Needs calculation based on max duration of selected packages or a specific field
        MSISDN: msisdn, // Included MSISDN field

        // Array of all selected packages with their adjusted prices and linked device details
        Packages: selectedPackagesDetails.map((pkg) => ({
          PackageID: pkg.PackageID,
          BaseMonthlyPrice: pkg.BaseMonthlyPrice, // Original price of package
          AdjustedMonthlyPrice: pkg.AdjustedMonthlyPrice, // Price after device cost
          SubscriptionStatus: pkg.SubscriptionStatus,
          ContractDuration: pkg.ContractDuration,
          DeviceAssigned: pkg.DeviceAssigned, // Null if no device, or object with device details
          DisplayName: pkg.DisplayName,
        })),
      };

      console.log("Contract data for API submission:", contractData);
      console.log("Current user role:", role);

      // --- 9. API Interaction Logic (Remains largely the same, but ensure contractData matches backend) ---
      
        // User creating contract logic
        const response = await axiosInstance.post(
          `/contracts/createInitialContract`,
          contractData
        );
        if (response.status === 201 || response.status === 200) {
          handleClose();
          Swal.fire({
            icon: "success",
            title: "Contract Application Submitted!",
            text: "Your application has been successfully received.",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        }
      
    } catch (error) {
      handleClose();
      console.error("Error saving contract:", error);
      Swal.fire({
        icon: "error",
        title: "Saving Error",
        text: error.message || "Error saving contract. Please try again.",
      });
    }
  };

  const handleEmployeeSelect = (selectedUserData) => {
    console.log("Selected Employee Code:", selectedUserData.EmployeeCode);
    selectedUserData = userData; // Directly set userData based on selection
  };

  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (userData?.EmployeeCode) {
      setIsDataReady(true);
    }
  }, [userData]);

  useEffect(() => {
    if (isDataReady) {
      const loadContractData = async () => {
        try {
          const response = await axiosInstance.get(
            `/contracts/latestPendingEmployeeContract/${userData.EmployeeCode}`
          );
          console.log("code", userData.EmployeeCode);
          if (response.data) {
            const latestContract = response.data;
            setContractData(latestContract);

            const mappedRows = mapContractDataToDataGrid(latestContract);
            setRows(mappedRows);
          } else {
            console.warn("No pending contract data found for the employee.");
          }
        } catch (error) {
          console.error("Error fetching latest contract:", error);
        } finally {
          setLoading(false);
        }
      };

      loadContractData();
    }
  }, [isDataReady]);

  const mapContractDataToDataGrid = (contractData) => {
    return rows.map((row) => {
      switch (row.id) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          // Handle PackageID for rows with IDs 1–5
          if (
            contractData.PackageID &&
            row.packageID === contractData.PackageID
          ) {
            return { ...row, column2: contractData.PackageID };
          }

          // Handle SubscriptionStatus for rows with IDs 1–5
          if (
            contractData.SubscriptionStatus &&
            row.SubscriptionStatus === contractData.SubscriptionStatus
          ) {
            return { ...row, column6: contractData.SubscriptionStatus };
          }
          return row;
        case 6:
          return {
            ...row,
            column2: contractData.DevicePrice,
            column3: contractData.DeviceName,
          };
        case 9:
          return {
            ...row,
            column2: userData.staffWithAirtimeAllocation[0].FullName,
          };
        case 10:
          return {
            ...row,
            column2: userData.staffWithAirtimeAllocation[0].EmployeeCode,
          };
        case 11:
          return userData.ServicePlan === "Postpaid"
            ? {
                ...row,
                column2:
                  "POST: " + userData.staffWithAirtimeAllocation[0].PhoneNumber,
              }
            : {
                ...row,
                column3:
                  "PRE: " + userData.staffWithAirtimeAllocation[0].PhoneNumber,
              };
        case 13:
          return {
            ...row,
            column2: userData.staffWithAirtimeAllocation[0].AirtimeAllocation,
          };
        case 14:
          return {
            ...row,
            column2: contractData.MonthlyPayment,
            column5: contractData.LimitCheck,
          };
        default:
          return row;
      }
    });
  };

  const handleApproval = async (approvalType) => {
    try {
      const response = await axiosInstance.post(
        `/contracts/${approvalType.toLowerCase()}/${
          selectedContract.ContractNumber
        }`,
        {
          ContractID: selectedContract.ContractID,
          ApprovalType: approvalType,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Contract has been ${approvalType.toLowerCase()} successfully.`,
        });

        // Notify user of contract approval or rejection
        const notificationData = {
          EmployeeCode: selectedContract.EmployeeCode,
          Type: "1",
          Message: `Contract ${
            selectedContract.ContractNumber
          } has been ${approvalType.toLowerCase()} by admin`,
          Recipient: "3",
        };

        const notificationResponse = await axiosInstance.post(
          "/notifications/createNotification",
          notificationData
        );

        if (notificationResponse.status === 201) {
          const notification = notificationResponse.data;
          console.log("Notification created:", notification);
          dispatch(addNotification(notification));
        }

        handleClose(); // Close modal
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while processing the contract.",
        });
      }
    } catch (error) {
      console.error("Error processing contract:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while processing the contract.",
      });
    }
  };

  const columns = [
    { field: "id", headerName: "#", width: 90 },
    {
      field: "dropdown",
      headerName: "PRODUCT",
      width: 230,
      renderCell: (params) => {
        if (params.row.id <= 5) {
          return (
            <select
              className="border-0 shadow-none bg-transparent"
              value={params.value}
              onChange={(event) =>
                handleDropdownChange(event, params.row.id, "dropdown")
              }
            >
              {dropdownOptions.map((option) => (
                <option key={option.PackageName} value={option.PackageName}>
                  {option.PackageName}
                </option>
              ))}
            </select>
          );
        }
        return params.value;
      },
    },
    {
      field: "column2",
      headerName: "PRICE/MUL",
      width: 150,
      editable: true, // Make editable for all rows
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          // Rows with id between 6 and 8, show empty input or placeholder
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column2")
              }
              ref={(el) => (devicePriceRef.current[params.row.id] = el)}
              placeholder="Enter Device Price Per Month"
              disabled={false}
              // Optionally disable editing for these rows
            />
          );
        } else {
          // Rows with id <= 5 or id >= 9, show existing value or editable input
          return params.value;
        }
      },
    },
    {
      field: "column3",
      headerName: "DEVICE",
      width: 150,
      editable: (params) =>
        params.row.id === 6 || params.row.id === 7 || params.row.id === 8,
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          // Rows with id between 6 and 8, show empty input or placeholder
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column3")
              }
              ref={(el) => (deviceNameRef.current[params.row.id] = el)}
              placeholder="Enter Device Name"
              disabled={false}
              // Optionally disable editing for these rows
            />
          );
        } else {
          // Rows with id <= 5 or id >= 9, show existing value or editable input
          return params.value;
        }
      },
    },
    {
      field: "column4",
      headerName: "MSISDN",
      width: 150,
      editable: role === 1, // Only editable by admin
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          // Rows with id between 6 and 8, show empty input or placeholder
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column4")
              }
              ref={(el) => (msisdnRef.current[params.row.id] = el)}
              placeholder="Enter Device MSISDN"
              disabled={false}
              // Optionally disable editing for these rows
            />
          );
        } else {
          // Rows with id <= 5 or id >= 9, show existing value or editable input
          return params.value;
        }
      },
    },
    {
      field: "column5",
      headerName: "UPFRONT PAYMENT",
      width: 150,
      editable: true,
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          // Rows with id between 6 and 8, show empty input or placeholder
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column5")
              }
              ref={(el) => (upfrontPaymentRef.current[params.row.id] = el)}
              placeholder="Enter price/mul"
              disabled={false}
              // Optionally disable editing for these rows
            />
          );
        } else {
          // Rows with id <= 5 or id >= 9, show existing value or editable input
          return params.value;
        }
      },
    },
    {
      field: "column6",
      headerName: "TRANSACTION TYPE",
      width: 150,
      editable: true,
      renderCell: (params) => {
        if (params.row.id <= 5) {
          return (
            <select
              className="border-0 shadow-none bg-transparent"
              value={params.value}
              onChange={(event) =>
                handleDropdownChange(event, params.row.id, "column6")
              }
            >
              <option value="">Select Transaction Type</option>
              {[
                "New",
                "Renewal",
                "Package Change",
                "Ownership Transfer In",
                "Ownership Transfer Out",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return params.value;
      },
    },
  ];

  const handleRowEditCommit = (params) => {
    const updatedRows = rows.map((row) =>
      row.id === params.id ? { ...row, [params.field]: params.value } : row
    );
    setRows(updatedRows);
  };

  const getRowClassName = (params) => {
    if (params.row.id >= 6 && params.row.id <= 14) {
      if (params.row.dropdown === "New Allowance/ MUL") {
        return "red-row";
      }
      return "bold-row";
    }
    return "";
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        // className="modal-container"
        ref={modalRef}
        sx={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "2vh",
          width: "70%",
          maxHeight: "95vh",
          overflow: "auto",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        {isUserDataLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="400px"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}
          >
            <CircularProgress size={40} sx={{ color: "#0096D6", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#666" }}>
              Loading user data...
            </Typography>
            <Typography variant="body2" sx={{ color: "#999", mt: 1 }}>
              Please wait while we fetch your current allocation information.
            </Typography>
          </Box>
        ) : (
        <div>
          <div className="top text-center">
            {/* Title and close modal button */}
            <div className="mt-4 row justify-content-end">
              <div className="col-4"></div>
              <div className="col-md-4 text-center">
                <h5 className="fw-bold">
                  Voucher For Staff Service Plans Benefit
                </h5>
              </div>

              <div className="col-md-4 mb-1 align-items-center">
                <>
                  <Button
                    onClick={handleSave}
                    className="download-btn"
                    style={{
                      fontSize: "14px",
                      height: "100%",
                      width: "40%",
                      backgroundColor: "#0096D6",
                      color: "#fff",
                      padding: "8px",
                      paddingLeft: "10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      borderColor: "#1A69AC",
                      border: "1px solid",
                    }}
                  >
                    Submit
                  </Button>

                  <CancelPresentationIcon
                    onClick={() => {
                      handleClose();
                    }}
                    style={{
                      marginLeft: "10px",
                      color: "#BB1616",
                      fontSize: "40px",
                      cursor: "pointer",
                    }}
                  />
                </>
              </div>
            </div>

            <p
              className="mx-auto border-top border-bottom p-4 text-danger"
              id="line"
            >
              This document is only valid for the date and the time that it was
              printed and contains information, which is the property of MTC. No
              part of the document may be reproduced or transmitted in any form
              by any means, without written permission from MTC.
            </p>
          </div>

          <div className="border mx-auto">
            <Box
              m="40px 0 0 0"
              width="94%"
              marginLeft="auto"
              marginRight="auto"
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
                  backgroundColor: "#1674BB",
                  color: "white",
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  "& .MuiDataGrid-row:nth-of-type(odd)": {
                    backgroundColor: colors.primary[400],
                  },
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
                checkboxSelection={false}
                hideFooter
                autoHeight
                disableSelectionOnClick
                onEditCellChangeCommitted={(params) =>
                  handleRowEditCommit(params)
                }
                showCellVerticalBorder
                getRowClassName={getRowClassName}
              />
            </Box>
          </div>

          {modalOpen && (
            <div className="modal">
              <div className="modal-content">
                <UploadVoucher
                  style={{ height: "100%" }}
                  open={modalOpen}
                  handleClose={handleCloseUpload}
                />
              </div>
            </div>
          )}
        </div>
        )}
      </Box>
    </Modal>
  );
};

export default BenefitVoucher;
