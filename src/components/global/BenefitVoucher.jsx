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

const BenefitVoucher = ({
  open,
  handleClose,
  role,
  prefillData = null,
  simulationMeta = null,
}) => {
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

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenUpload = () => setModalOpen(true);
  const handleCloseUpload = () => setModalOpen(false);
  const [withinLimit, setWithinLimit] = useState(null);
  const [topUpEligible, setTopUpEligible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [acceptsTopUp, setAcceptsTopUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSimulationLocked =
    Array.isArray(prefillData) && prefillData.length > 0;

  useEffect(() => {
    const handle = async () => {
      try {
        setIsUserDataLoading(true);
        const response = await axiosInstance.get(
          `/staffmember/allocation/${currentUser.EmployeeCode}`
        );
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
      setTopUpEligible(false);
      setTopUpAmount(0);
      setAcceptsTopUp(false);
      setIsSubmitting(false);
    }
  }, [open, currentUser?.EmployeeCode]);
  useEffect(() => {
    if (
      userData &&
      userData.staffWithAirtimeAllocation &&
      userData.staffWithAirtimeAllocation.length > 0
    ) {
      setEmployeeCode(userData.staffWithAirtimeAllocation[0]?.EmployeeCode);
    } else {
      // Optional: Log what userData looks like if it doesn't meet the conditions
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
        const response = await axiosInstance.get(`/packages/packageList?t=${Date.now()}`);
        if (response.status < 200 || response.status >= 300) {
          throw new Error("Failed to fetch dropdown values");
        }

        const data = response.data;

        // Add "Select Package" option if it's not in the data
        const dropdownOptions = data.some(
          (option) => option.PackageName === "Select Package"
        )
          ? data
          : [{ PackageName: "Select Package" }, ...data];

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

  const buildPackageRow = (index, prefill) => {
    const id = index + 1;
    if (!prefill?.packageName) {
      return {
        id,
        dropdown: "Select Package",
        column2: "",
        column3: "",
        column4: "",
        column5: "",
        column6: "Select Type",
      };
    }

    const selectedOption = dropdownOptions.find(
      (option) => option.PackageName === prefill.packageName
    );
    const price = prefill.packagePrice ?? selectedOption?.MonthlyPrice ?? "";

    return {
      id,
      dropdown: prefill.packageName,
      column2: `${price}`,
      column3: "",
      column4: "",
      column5: "",
      column6: prefill.subscriptionType || "New",
      packageID: prefill.packageID ?? selectedOption?.PackageID ?? null,
    };
  };

  const buildEquipmentRow = (index, prefill) => ({
    id: index + 6,
    dropdown: "Equipment Plan",
    column2: prefill?.devicePrice ? `${prefill.devicePrice}` : "",
    column3: prefill?.deviceName || "",
    column4: "",
    column5: "",
    column6: "",
  });

  // Initialize rows with user data when both are available
  useEffect(() => {
    if (userData && dropdownOptions.length > 0 && rows.length === 0) {
      const initialRows = Array.from({ length: 5 }, (_, index) =>
        buildPackageRow(index, prefillData?.[index])
      );

      const staticRows = [
        buildEquipmentRow(0, prefillData?.[0]),
        buildEquipmentRow(1, prefillData?.[1]),
        buildEquipmentRow(2, prefillData?.[2]),
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
          column2: userData.staffWithAirtimeAllocation[0].ServicePlan === "PostPaid" 
            ? "POST: " + userData.staffWithAirtimeAllocation[0].PhoneNumber 
            : "",
          column3: userData.staffWithAirtimeAllocation[0].ServicePlan === "PrePaid" 
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

      setRows([...initialRows, ...staticRows]);

      if (prefillData?.length) {
        const prefilledDevicePrices = {};
        prefillData.forEach((contract, index) => {
          if (contract?.devicePrice) {
            prefilledDevicePrices[index + 6] = parseFloat(contract.devicePrice) || 0;
          }
        });
        if (Object.keys(prefilledDevicePrices).length > 0) {
          setDevicePrices((prev) => ({ ...prev, ...prefilledDevicePrices }));
        }
      }
    }
  }, [userData, dropdownOptions.length, prefillData]);

  useEffect(() => {
    if (!open || !prefillData?.length || rows.length === 0) return;

    prefillData.forEach((contract, index) => {
      const deviceRowId = index + 6;
      if (contract?.deviceName && deviceNameRef.current[deviceRowId]) {
        deviceNameRef.current[deviceRowId].value = contract.deviceName;
      }
      if (contract?.devicePrice && devicePriceRef.current[deviceRowId]) {
        devicePriceRef.current[deviceRowId].value = contract.devicePrice;
      }
    });
  }, [open, prefillData, rows.length]);

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
              "PostPaid"
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
    if (isSimulationLocked && id >= 1 && id <= 8) {
      return;
    }
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
    if (isSimulationLocked && field === "dropdown" && rowId >= 1 && rowId <= 5) {
      return;
    }
    if (field === "column6" && rowId >= 1 && rowId <= 5) {
      const packageRow = rows.find((row) => row.id === rowId);
      const hasPackage =
        !!packageRow?.packageID ||
        (!!packageRow?.dropdown &&
          packageRow.dropdown !== "Select Package" &&
          !!packageRow?.column2);
      if (!hasPackage) return;
    }
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

  const resolvePackageDuration = (packageName, packageID = null) => {
    const selectedOption = dropdownOptions.find(
      (option) =>
        (packageID && option.PackageID === packageID) ||
        option.PackageName === packageName
    );
    const fromPaymentPeriod = parseInt(
      String(selectedOption?.PaymentPeriod || "").replace(/\s*months?/i, ""),
      10
    );
    if (!isNaN(fromPaymentPeriod) && fromPaymentPeriod > 0) {
      return fromPaymentPeriod;
    }

    const durationMatch =
      String(packageName || "").match(/\((\d+)\)/) ||
      String(packageName || "").match(/(\d+)/);
    return durationMatch ? parseInt(durationMatch[1], 10) : 0;
  };

  const getDevicePriceForRow = (row) => {
    const fromRef = parseFloat(devicePriceRef.current?.[row.id]?.value);
    if (!isNaN(fromRef) && fromRef > 0) return fromRef;
    const fromRow = parseFloat(row.column2 || 0);
    return !isNaN(fromRow) ? fromRow : 0;
  };

  const getContractDurationForDeviceRow = (updatedRows, deviceRowId) => {
    // Equipment rows 6/7/8 link to package rows 1/2/3
    const packageRow = updatedRows.find((row) => row.id === deviceRowId - 5);
    if (!packageRow?.dropdown || packageRow.dropdown === "Select Package") {
      return 0;
    }
    return resolvePackageDuration(packageRow.dropdown, packageRow.packageID);
  };

  const getTopUpDuration = (updatedRows) => {
    let maxDuration = 0;

    for (let deviceRowId = 6; deviceRowId <= 8; deviceRowId++) {
      const row = updatedRows.find((r) => r.id === deviceRowId);
      if (!row) continue;
      if (!getDevicePriceForRow(row)) continue;

      const duration = getContractDurationForDeviceRow(updatedRows, deviceRowId);
      if (duration > maxDuration) maxDuration = duration;
    }

    if (maxDuration > 0) return maxDuration;

    for (const row of updatedRows) {
      if (row.id < 1 || row.id > 5) continue;
      if (!row.dropdown || row.dropdown === "Select Package") continue;

      const duration = resolvePackageDuration(row.dropdown, row.packageID);
      if (duration > 0) return duration;
    }

    return 0;
  };

  const calculateMUL = (updatedRows) => {
    // Guard clause: Don't calculate if userData is not available
    if (!userData || userData.available == null) {
      return updatedRows;
    }

    // Package rows 1-5: column2 is already monthly package price
    const packageMonthlyTotal = updatedRows.reduce((sum, row) => {
      if (row.id >= 1 && row.id <= 5) {
        return sum + (parseFloat(row.column2) || 0);
      }
      return sum;
    }, 0);

    // Equipment rows 6-8: column2 is the full device price — amortize over
    // the linked package duration (same as handleSave / simulator)
    const deviceMonthlyTotal = updatedRows.reduce((sum, row) => {
      if (row.id < 6 || row.id > 8) return sum;

      const devicePrice = getDevicePriceForRow(row);
      if (!devicePrice) return sum;

      const duration = getContractDurationForDeviceRow(updatedRows, row.id);
      const monthlyDeviceCost = duration > 0 ? devicePrice / duration : 0;
      const upfrontPayment = parseFloat(row.column5) || 0;

      return sum + monthlyDeviceCost + upfrontPayment;
    }, 0);

    const baseAvailableAmount = parseFloat(userData.available) || 0;
    const totalMonthlyCost = packageMonthlyTotal + deviceMonthlyTotal;
    const newAllowance = parseFloat(
      (baseAvailableAmount - totalMonthlyCost).toFixed(2)
    );
    const isWithinLimit = newAllowance >= 0;

    // Top-up is allowed only when packages fit but device cost pushes over.
    // Total top-up = monthly excess × package duration.
    const packagesWithinLimit = packageMonthlyTotal <= baseAvailableAmount;
    const monthlyTopUp =
      !isWithinLimit && packagesWithinLimit ? Math.abs(newAllowance) : 0;
    const topUpDuration = getTopUpDuration(updatedRows);
    const calculatedTopUp =
      monthlyTopUp > 0 && topUpDuration > 0
        ? parseFloat((monthlyTopUp * topUpDuration).toFixed(2))
        : monthlyTopUp;
    const isTopUpEligible = calculatedTopUp > 0;

    setWithinLimit(isWithinLimit);
    setTopUpEligible(isTopUpEligible);
    setTopUpAmount(calculatedTopUp);
    if (!isTopUpEligible && !simulationMeta?.acceptsTopUp) {
      setAcceptsTopUp(false);
    }

    let limitLabel = "Within limit";
    if (!isWithinLimit && isTopUpEligible) {
      limitLabel = acceptsTopUp
        ? "Within limit (with top-up)"
        : "Top-up required";
    } else if (!isWithinLimit) {
      limitLabel = "Exceeding limit";
    }

    return updatedRows.map((row) => {
      if (row.id === 14) {
        return {
          ...row,
          column2: newAllowance,
          column5: limitLabel,
        };
      }
      return row;
    });
  };

  useEffect(() => {
    // Only calculate if userData is available and not loading
    if (userData && !isUserDataLoading) {
      const updatedRows = calculateMUL(rows);
      if (JSON.stringify(updatedRows) !== JSON.stringify(rows)) {
        setRows(updatedRows);
      }
    }
  }, [rows, withinLimit, userData, isUserDataLoading, acceptsTopUp]);

  useEffect(() => {
    if (open && simulationMeta?.acceptsTopUp) {
      setAcceptsTopUp(true);
    } else if (!open) {
      setAcceptsTopUp(false);
    }
  }, [open, simulationMeta]);

  const formatCurrency = (value) =>
    `N$ ${(Number(value) || 0).toLocaleString("en-NA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const isCellEditable = (params) => {
    if (isSimulationLocked && params.id >= 1 && params.id <= 8) {
      return false;
    }
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
  const handleSave = async (options = {}) => {
    const topUpConfirmed = options.topUpConfirmed === true || acceptsTopUp;

    // --- 1. Initial Limit Check (remains first) ---
    if (!(withinLimit || (topUpEligible && topUpConfirmed))) {
      if (topUpEligible && !topUpConfirmed) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Top-up Confirmation Required",
          html: `This application exceeds your available allowance.<br/><br/>Total top-up required: <strong>${formatCurrency(
            topUpAmount
          )}</strong><br/><br/>Confirm that you can top up to submit this voucher.`,
          showCancelButton: true,
          confirmButtonColor: "#0096D6",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Confirm & Submit",
          cancelButtonText: "Cancel",
        });
        if (result.isConfirmed) {
          setAcceptsTopUp(true);
          return handleSave({ topUpConfirmed: true });
        }
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Limit Exceeded",
        text: "The new allowance is not within the allowed limit (70% of Airtime Allocation).",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // --- 2. Basic Form Data Check ---
      if (!rows || rows.length === 0) {
        throw new Error("Form data is empty. Please fill in the form.");
      }

      // --- 3. Validate and Aggregate Selected Packages (Rows 1-5) ---
      const selectedPackagesDetails = [];
      const packageRows = rows.filter((row) => row.id >= 1 && row.id <= 5);

      for (const packageRow of packageRows) {
        if (packageRow.column2) {
          if (!packageRow.column6 || packageRow.column6 === "Select Type") {
            const packageName =
              packageRow.dropdown && packageRow.dropdown !== "Select Package"
                ? `for Package: ${packageRow.dropdown}`
                : `in row ${packageRow.id}`;
            throw new Error(
              `Please select a valid subscription type ${packageName}. 'Select Type' is not allowed.`
            );
          }

          const packageID =
            packageRow.packageID ||
            dropdownOptions.find(
              (option) => option.PackageName === packageRow.dropdown
            )?.PackageID;

          if (!packageID) {
            throw new Error(
              `Could not resolve Package ID for ${
                packageRow.dropdown || `row ${packageRow.id}`
              }.`
            );
          }

          const contractDuration = resolvePackageDuration(
            packageRow.dropdown,
            packageID
          );
          if (!contractDuration) {
            throw new Error(
              `Invalid package format for ${
                packageRow.dropdown || `row ${packageRow.id}`
              }. Could not extract contract duration.`
            );
          }
          const monthlyPrice = parseFloat(packageRow.column2);

          selectedPackagesDetails.push({
            id: packageRow.id,
            PackageID: packageID,
            BaseMonthlyPrice: monthlyPrice,
            SubscriptionStatus: packageRow.column6,
            ContractDuration: contractDuration,
            DisplayName: packageRow.dropdown,
            DeviceAssigned: null,
            AdjustedMonthlyPrice: monthlyPrice,
          });
        }
      }

      if (selectedPackagesDetails.length === 0) {
        throw new Error(
          "Please select at least one package from the first five rows."
        );
      }

      // --- 4. Validate and Aggregate Device Details (Rows 6-8) ---
      const selectedDevicesDetails = [];

      for (let i = 0; i < 3; i++) {
        const deviceIdx = 6 + i;
        const deviceRow = rows.find((row) => row.id === deviceIdx);
        const deviceName =
          deviceNameRef.current[deviceIdx]?.value ||
          deviceRow?.column3 ||
          "";
        let devicePrice = parseFloat(
          devicePriceRef.current[deviceIdx]?.value ??
            deviceRow?.column2 ??
            devicePrices[deviceIdx]
        );

        if (deviceName || (!isNaN(devicePrice) && devicePrice > 0)) {
          if (isNaN(devicePrice) || devicePrice <= 0) {
            throw new Error(
              `Device price for ${
                deviceName || `device in row ${deviceIdx}`
              } must be a positive number.`
            );
          }
          selectedDevicesDetails.push({
            id: deviceIdx,
            DeviceName: deviceName,
            DevicePrice: devicePrice,
            UpfrontPayment:
              parseFloat(upfrontPaymentRef.current[deviceIdx]?.value) || 0,
          });
        }
      }

      // --- 5. Assign Devices to Packages and Adjust Prices ---
      selectedPackagesDetails.forEach((packageDet) => {
        const device = selectedDevicesDetails.find(
          (item) => item.id === packageDet.id + 5
        );
        if (!device) return;

        const packageOption = dropdownOptions.find(
          (option) =>
            option.PackageID === packageDet.PackageID ||
            option.PackageName === packageDet.DisplayName
        );
        const hasDeviceLimit =
          packageOption?.HasDeviceLimit === true ||
          packageOption?.HasDeviceLimit === 1 ||
          packageOption?.HasDeviceLimit === "1" ||
          packageOption?.HasDeviceLimit === "true";
        const deviceLimit = parseFloat(packageOption?.DeviceLimit);
        if (
          hasDeviceLimit &&
          !Number.isNaN(deviceLimit) &&
          deviceLimit > 0 &&
          device.DevicePrice > deviceLimit
        ) {
          throw new Error(
            `Device "${device.DeviceName || "selected"}" (N$${device.DevicePrice.toLocaleString()}) exceeds the device limit of N$${deviceLimit.toLocaleString()} for package "${packageDet.DisplayName}".`
          );
        }

        const monthlyDeviceCost =
          device.DevicePrice / packageDet.ContractDuration;

        packageDet.DeviceAssigned = {
          DeviceName: device.DeviceName,
          DevicePrice: device.DevicePrice,
          UpfrontPayment: device.UpfrontPayment,
          MonthlyDeviceCost: monthlyDeviceCost,
        };
        packageDet.AdjustedMonthlyPrice += monthlyDeviceCost;
      });

      // --- 6. Extract Other Global Details ---
      const employeeCode = rows.find((row) => row.id === 10)?.column2;
      if (!employeeCode) {
        throw new Error(
          "Employee code is missing. Please enter an employee code."
        );
      }

      let msisdn = "";
      if (role === 1) {
        msisdn =
          rows.find((row) => row.id === 11)?.column2 ||
          rows.find((row) => row.id === 11)?.column3;
        if (!msisdn) {
          throw new Error("MSISDN is missing. Admin must fill this field.");
        }
      }

      const updatedRows = calculateMUL(rows);
      const currentAllowance = parseFloat(
        updatedRows.find((row) => row.id === 12)?.column2 || 0
      );
      const newAllowance = parseFloat(
        updatedRows.find((row) => row.id === 14)?.column2 || 0
      );

      const totalPackagesMonthlyCost = selectedPackagesDetails.reduce(
        (sum, pkg) => sum + pkg.AdjustedMonthlyPrice,
        0
      );
      const packageOnlyMonthlyCost = selectedPackagesDetails.reduce(
        (sum, pkg) => sum + pkg.BaseMonthlyPrice,
        0
      );

      if (userData.available - packageOnlyMonthlyCost < 0) {
        throw new Error(
          `The total monthly package cost exceeds the allowed limit (${userData.staffWithAirtimeAllocation[0].AirtimeAllocation.toFixed(
            2
          )}). Top-up cannot cover package overage.`
        );
      }

      if (userData.available - totalPackagesMonthlyCost < 0 && !topUpConfirmed) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Top-up Confirmation Required",
          html: `Device costs exceed your available allowance.<br/><br/>Total top-up required: <strong>${formatCurrency(
            topUpAmount
          )}</strong>`,
          showCancelButton: true,
          confirmButtonColor: "#0096D6",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Confirm & Submit",
          cancelButtonText: "Cancel",
        });
        if (result.isConfirmed) {
          setAcceptsTopUp(true);
          setIsSubmitting(false);
          return handleSave({ topUpConfirmed: true });
        }
        return;
      }

      const monthlyPayment = currentAllowance - newAllowance;
      const limitCheckForDb =
        withinLimit || (topUpEligible && topUpConfirmed)
          ? "Within Limit"
          : "Exceeding Limit";
      const submittedTopUpAmount =
        topUpEligible && topUpConfirmed ? topUpAmount : 0;

      const contractData = {
        EmployeeCode: employeeCode,
        MonthlyPayment: monthlyPayment,
        LimitCheck: limitCheckForDb,
        ApprovalStatus: "Pending",
        ContractStartDate: new Date().toISOString().split("T")[0],
        ContractEndDate: "",
        MSISDN: msisdn,
        TopUpAmount: submittedTopUpAmount,
        Packages: selectedPackagesDetails.map((pkg) => ({
          PackageID: pkg.PackageID,
          BaseMonthlyPrice: pkg.BaseMonthlyPrice,
          AdjustedMonthlyPrice: pkg.AdjustedMonthlyPrice,
          SubscriptionStatus: pkg.SubscriptionStatus,
          ContractDuration: pkg.ContractDuration,
          DeviceAssigned: pkg.DeviceAssigned,
          DisplayName: pkg.DisplayName,
        })),
      };

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
      console.error("Error saving contract:", error);
      const apiMessage =
        error.response?.data?.message ||
        error.message ||
        "Error saving contract. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Saving Error",
        text: apiMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeSelect = (selectedUserData) => {
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
          return userData.ServicePlan === "PostPaid"
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
          if (isSimulationLocked) {
            return (
              <span className="border-0 shadow-none bg-transparent">
                {params.value && params.value !== "Select Package"
                  ? params.value
                  : ""}
              </span>
            );
          }
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
      editable: !isSimulationLocked,
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column2")
              }
              ref={(el) => (devicePriceRef.current[params.row.id] = el)}
              placeholder={isSimulationLocked ? "" : "Enter Device Price"}
              readOnly={isSimulationLocked}
              disabled={isSimulationLocked}
            />
          );
        } else {
          return params.value;
        }
      },
    },
    {
      field: "column3",
      headerName: "DEVICE",
      width: 150,
      editable: (params) =>
        !isSimulationLocked &&
        (params.row.id === 6 || params.row.id === 7 || params.row.id === 8),
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column3")
              }
              ref={(el) => (deviceNameRef.current[params.row.id] = el)}
              placeholder={isSimulationLocked ? "" : "Enter Device Name"}
              readOnly={isSimulationLocked}
              disabled={isSimulationLocked}
            />
          );
        } else {
          return params.value;
        }
      },
    },
    {
      field: "column4",
      headerName: "MSISDN",
      width: 150,
      editable: role === 1,
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column4")
              }
              ref={(el) => (msisdnRef.current[params.row.id] = el)}
              placeholder={isSimulationLocked ? "" : "Enter Device MSISDN"}
              readOnly={isSimulationLocked}
              disabled={isSimulationLocked}
            />
          );
        } else {
          return params.value;
        }
      },
    },
    {
      field: "column5",
      headerName: "UPFRONT PAYMENT",
      width: 150,
      editable: !isSimulationLocked,
      renderCell: (params) => {
        if (params.row.id >= 6 && params.row.id <= 8) {
          return (
            <input
              className="border-0 shadow-none bg-transparent"
              type="text"
              defaultValue={params.value}
              onChange={(event) =>
                handleInputChange(event, params.row.id, "column5")
              }
              ref={(el) => (upfrontPaymentRef.current[params.row.id] = el)}
              placeholder={isSimulationLocked ? "" : "Enter price/mul"}
              readOnly={isSimulationLocked}
              disabled={isSimulationLocked}
            />
          );
        } else {
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
          const hasPackage =
            !!params.row.packageID ||
            (!!params.row.dropdown &&
              params.row.dropdown !== "Select Package" &&
              !!params.row.column2);

          if (!hasPackage) {
            return (
              <span className="border-0 shadow-none bg-transparent">
                {params.value && params.value !== "Select Type"
                  ? params.value
                  : ""}
              </span>
            );
          }

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
            <div className="mt-4 row justify-content-end align-items-center">
              <div className="col-4"></div>
              <div className="col-md-4 text-center">
                <h5 className="fw-bold">
                  Voucher For Staff Service Plans Benefit
                </h5>
              </div>

              <div className="col-md-4 mb-1 d-flex justify-content-end align-items-center">
                <CancelPresentationIcon
                  onClick={() => {
                    handleClose();
                  }}
                  style={{
                    color: "#BB1616",
                    fontSize: "40px",
                    cursor: "pointer",
                  }}
                />
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
                key={prefillData ? `prefill-${prefillData.length}` : "default"}
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

          <div className="d-flex justify-content-end align-items-center mt-3 mb-2 px-3">
            <Button
              onClick={handleSave}
              className="download-btn"
              disabled={isSubmitting || isUserDataLoading}
              style={{
                fontSize: "14px",
                backgroundColor: isSubmitting ? "#6c757d" : "#0096D6",
                color: "#fff",
                padding: "8px 24px",
                borderRadius: "5px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                borderColor: "#1A69AC",
                border: "1px solid",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
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
