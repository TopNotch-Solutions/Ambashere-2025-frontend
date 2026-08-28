import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import {
  AIRTIME_MSISDN_HELPER,
  AIRTIME_TRANSACTION_TYPES,
  isRenewalTransaction,
  isValidAirtimeMsisdn,
  normalizeAirtimeMsisdn,
} from "../../../utils/airtimeMsisdn";

const AirtimeBenefitSimulator = ({
  embedded = false,
  onApplySimulation,
  editingSubmission = null,
  onUpdated,
}) => {
  const [packages, setPackages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [numberOfContracts, setNumberOfContracts] = useState(1);
  const [contractData, setContractData] = useState([
    {
      selectedPackage: "",
      devicePrice: "",
      deviceName: "",
      packagePrice: "",
      subscriptionType: "New",
      msisdn: "",
    },
  ]);
  const [airtimeAllocation, setAirtimeAllocation] = useState("");
  const [availableAllowance, setAvailableAllowance] = useState(null);
  const [currentContracts, setCurrentContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [packagesError, setPackagesError] = useState("");
  const currentUser = useSelector((state) => state.auth.user);
  const employeeCode = currentUser?.EmployeeCode;
  const navigate = useNavigate();
  const isEditing = Boolean(
    editingSubmission?.submissionId || editingSubmission?.id
  );
  const editingSubmissionId =
    editingSubmission?.submissionId ?? editingSubmission?.id;
  const pendingMonthly = isEditing
    ? (isRenewalTransaction(
        editingSubmission?.transaction_type ||
          editingSubmission?.TransactionType
      )
        ? Number(editingSubmission?.device_monthly_price) || 0
        : (Number(editingSubmission?.device_monthly_price) || 0) +
          (Number(editingSubmission?.serviceplan_monthly_price) || 0)) ||
      Number(editingSubmission?.MonthlyPayment) ||
      0
    : 0;

  const sortedPackages = useMemo(
    () =>
      [...packages].sort((a, b) =>
        (a?.PackageName || "").localeCompare(b?.PackageName || "")
      ),
    [packages]
  );

  const sortedDevices = useMemo(
    () =>
      [...devices].sort((a, b) =>
        (a?.device_name || "").localeCompare(b?.device_name || "")
      ),
    [devices]
  );

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return `N$ ${numberValue.toLocaleString("en-NA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setPackagesError("");
        setDevicesError("");
        const [packagesResponse, devicesResponse] = await Promise.all([
          axiosInstance.get(`/packages/packageList?t=${Date.now()}`),
          axiosInstance.get("/pricelist/device-price-list"),
        ]);
        setPackages(packagesResponse.data || []);
        setDevices(devicesResponse?.data?.data || []);
      } catch (error) {
        console.error("Error fetching simulator data:", error);
        setPackagesError("Unable to load package list.");
        setDevicesError("Unable to load device price list.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAirtimeAllocation = async () => {
      if (!employeeCode) return;

      try {
        const response = await axiosInstance.get(
          `/staffmember/staff/handset-allocation/${employeeCode}`
        );
        const allocation = response?.data?.myAllocation?.AirtimeAllocation || 0;
        setAirtimeAllocation(allocation);
      } catch (error) {
        console.error("Failed to load airtime allocation", error);
        setAirtimeAllocation(0);
      }
    };

    fetchAirtimeAllocation();
  }, [employeeCode]);

  useEffect(() => {
    const fetchAvailableAllowance = async () => {
      if (!employeeCode) return;
      try {
        const response = await axiosInstance.get(
          `/contracts/${employeeCode}`
        );
        setAvailableAllowance(
          response.data.available != null
            ? parseFloat(response.data.available)
            : null
        );
        setCurrentContracts(
          Array.isArray(response.data.contracts) ? response.data.contracts : []
        );
      } catch (error) {
        console.error("Failed to load available allowance", error);
        setCurrentContracts([]);
      }
    };

    fetchAvailableAllowance();
  }, [employeeCode]);

  const renewalMsisdnOptions = useMemo(() => {
    const seen = new Set();
    return (currentContracts || [])
      .filter((contract) => !contract.isSubmission)
      .map((contract) => {
        const msisdn = normalizeAirtimeMsisdn(
          contract.msisdn || contract.MSISDN || contract.staff_msisdn
        );
        const status = String(
          contract.subscription_status || contract.SubscriptionStatus || ""
        )
          .trim()
          .toLowerCase();
        return {
          msisdn,
          packageName: contract.package || contract.PackageName || "",
          status,
        };
      })
      .filter(
        (contract) =>
          isValidAirtimeMsisdn(contract.msisdn) &&
          contract.status !== "cancelled" &&
          contract.status !== "canceled" &&
          contract.status !== "done"
      )
      .filter((contract) => {
        if (seen.has(contract.msisdn)) return false;
        seen.add(contract.msisdn);
        return true;
      });
  }, [currentContracts]);

  useEffect(() => {
    if (!isEditing) return;
    setNumberOfContracts(1);
    setContractData([
      {
        selectedPackage: "",
        devicePrice: "",
        deviceName: "",
        packagePrice: "",
        subscriptionType: "",
        msisdn: "",
      },
    ]);
  }, [isEditing, editingSubmissionId]);

  const getPackageMonthlyCost = (contract) => {
    const selectedPkg = packages.find(
      (pkg) => pkg.PackageID === contract.selectedPackage
    );
    let packageTotal = parseFloat(selectedPkg?.MonthlyPrice) || 0;
    if (contract.netOption === "Yes") {
      packageTotal += 50;
    }
    return packageTotal;
  };

  // Renewal: package already running — only device is deducted from allowance.
  const getBillablePackageMonthlyCost = (contract) =>
    isRenewalTransaction(contract.subscriptionType)
      ? 0
      : getPackageMonthlyCost(contract);

  const getDeviceMonthlyCost = (contract) => {
    const selectedPkg = packages.find(
      (pkg) => pkg.PackageID === contract.selectedPackage
    );
    const durationMatch = selectedPkg?.PackageName.match(/\((\d+)\)/);
    const duration = durationMatch ? parseInt(durationMatch[1], 10) : 0;

    const monthlyDevicePayment = duration
      ? (parseFloat(contract.devicePrice) || 0) / duration
      : 0;
    const additionalDevicePayment = duration
      ? (parseFloat(contract.additionalDevicePrice) || 0) / duration
      : 0;

    return monthlyDevicePayment + additionalDevicePayment;
  };

  const getPackageDuration = (contract) => {
    const selectedPkg = packages.find(
      (pkg) => pkg.PackageID === contract.selectedPackage
    );
    const durationMatch = selectedPkg?.PackageName?.match(/\((\d+)\)/);
    return durationMatch ? parseInt(durationMatch[1], 10) : 0;
  };

  const getContractMonthlyPayment = (contract) =>
    getBillablePackageMonthlyCost(contract) + getDeviceMonthlyCost(contract);

  const limitBudget = useMemo(() => {
    const available =
      availableAllowance !== null
        ? parseFloat(availableAllowance) || 0
        : 0.7 * (parseFloat(airtimeAllocation) || 0);
    return available + (isEditing ? pendingMonthly : 0);
  }, [availableAllowance, airtimeAllocation, isEditing, pendingMonthly]);

  const getRemainingBeforeContract = (index, data = contractData) => {
    let remaining = limitBudget;
    for (let i = 0; i < index; i++) {
      remaining = Math.max(0, remaining - getContractMonthlyPayment(data[i]));
    }
    return remaining;
  };

  const isPackageWithinLimit = (packagePrice, remaining) =>
    (parseFloat(packagePrice) || 0) <= remaining;

  const packageAllowsDevice = (pkg) => {
    if (!pkg) return false;
    if (pkg.AllowsDevice === undefined || pkg.AllowsDevice === null) return true;
    return (
      pkg.AllowsDevice === true ||
      pkg.AllowsDevice === 1 ||
      pkg.AllowsDevice === "1" ||
      pkg.AllowsDevice === "true"
    );
  };

  const packageHasDeviceLimit = (pkg) => {
    if (!pkg) return false;
    return (
      pkg.HasDeviceLimit === true ||
      pkg.HasDeviceLimit === 1 ||
      pkg.HasDeviceLimit === "1" ||
      pkg.HasDeviceLimit === "true"
    );
  };

  const getPackageDeviceLimit = (pkg) => {
    if (!packageHasDeviceLimit(pkg)) return null;
    const limit = parseFloat(pkg.DeviceLimit);
    return Number.isNaN(limit) || limit <= 0 ? null : limit;
  };

  const isDeviceWithinPackageLimit = (pkg, devicePrice) => {
    const limit = getPackageDeviceLimit(pkg);
    if (limit === null) return true;
    return (parseFloat(devicePrice) || 0) <= limit;
  };

  const contractCalculations = useMemo(() => {
    let remaining = limitBudget;

    return contractData.map((contract) => {
      const selectedPkg = packages.find(
        (pkg) => pkg.PackageID === contract.selectedPackage
      );
      const displayPackageCost = getPackageMonthlyCost(contract);
      const packageCost = getBillablePackageMonthlyCost(contract);
      const allowsDevice = packageAllowsDevice(selectedPkg);
      const deviceCost = allowsDevice ? getDeviceMonthlyCost(contract) : 0;
      const monthly = packageCost + deviceCost;
      const packageWithinLimit = isPackageWithinLimit(packageCost, remaining);

      // Top-up only when package itself is within limit but device pushes over.
      // Total top-up = monthly excess × package duration.
      let topUp = 0;
      if (packageWithinLimit && allowsDevice && monthly > remaining) {
        const monthlyExcess = monthly - remaining;
        const duration = getPackageDuration(contract);
        topUp =
          duration > 0
            ? parseFloat((monthlyExcess * duration).toFixed(2))
            : monthlyExcess;
      }

      remaining = Math.max(0, remaining - monthly);

      return {
        monthly,
        packageCost: displayPackageCost,
        billablePackageCost: packageCost,
        deviceCost,
        packageWithinLimit,
        allowsDevice,
        topUp,
        canSelectDevice:
          packageWithinLimit && !!contract.selectedPackage && allowsDevice,
      };
    });
  }, [contractData, packages, limitBudget]);

  const monthlyPayment = useMemo(
    () =>
      contractCalculations.reduce((total, item) => total + item.monthly, 0),
    [contractCalculations]
  );

  const totalTopUp = useMemo(
    () => contractCalculations.reduce((total, item) => total + item.topUp, 0),
    [contractCalculations]
  );

  const remainingAfterSimulation = limitBudget - monthlyPayment;
  const checkLimit =
    remainingAfterSimulation >= 0 ? "Within Limit" : "Exceeding Limit";

  const handleNumberOfContractsChange = (event) => {
    const numContracts = parseInt(event.target.value);
    setNumberOfContracts(numContracts);

    setContractData((prevData) => {
      const newData = [...prevData];
      while (newData.length < numContracts) {
        newData.push({
          selectedPackage: "",
          devicePrice: "",
          deviceName: "",
          packagePrice: "",
          showNetOption: false,
          netOption: "",
          netAdditionalRow: false,
          packageError: "",
          subscriptionType: "New",
          msisdn: "",
        });
      }
      return newData.slice(0, numContracts);
    });
  };

  const clearDeviceSelection = (contract) => ({
    ...contract,
    deviceName: "",
    devicePrice: "",
    additionalDeviceName: "",
    additionalDevicePrice: "",
  });

  const handleContractChange = (index, field, value) => {
    setContractData((prevData) => {
      const updatedData = [...prevData];
      let updatedContract = { ...updatedData[index], [field]: value };
      const remaining = getRemainingBeforeContract(index, updatedData);

      if (field === "subscriptionType") {
        if (!isRenewalTransaction(value)) {
          updatedContract.msisdn = "";
          const packagePrice = getPackageMonthlyCost(updatedContract);
          if (
            updatedContract.selectedPackage &&
            !isPackageWithinLimit(packagePrice, remaining)
          ) {
            updatedContract = clearDeviceSelection({
              ...updatedContract,
              selectedPackage: "",
              packagePrice: "",
              showNetOption: false,
              netOption: "",
              netAdditionalRow: false,
              packageError: `This package (${formatCurrency(
                packagePrice
              )}) exceeds your remaining allowance (${formatCurrency(
                remaining
              )}). Choose a cheaper package — top-up cannot cover package overage.`,
            });
          }
        }
      }

      if (field === "msisdn") {
        updatedContract.msisdn = normalizeAirtimeMsisdn(value).slice(0, 9);
      }

      if (field === "selectedPackage") {
        if (!value) {
          updatedContract = clearDeviceSelection({
            ...updatedContract,
            selectedPackage: "",
            packagePrice: "",
            showNetOption: false,
            netOption: "",
            netAdditionalRow: false,
            packageError: "",
          });
          } else {
          const selectedPkg = packages.find((pkg) => pkg.PackageID === value);
          const packagePrice = parseFloat(selectedPkg?.MonthlyPrice) || 0;
          const billablePackagePrice = isRenewalTransaction(
            updatedContract.subscriptionType
          )
            ? 0
            : packagePrice;

          if (!isPackageWithinLimit(billablePackagePrice, remaining)) {
            // Package alone exceeds limit — cannot select, no top-up allowed
            updatedContract = clearDeviceSelection({
              ...updatedData[index],
              selectedPackage: "",
              packagePrice: "",
              showNetOption: false,
              netOption: "",
              netAdditionalRow: false,
              packageError: `This package (${formatCurrency(
                packagePrice
              )}) exceeds your remaining allowance (${formatCurrency(
                remaining
              )}). Choose a cheaper package — top-up cannot cover package overage.`,
            });
          } else {
            updatedContract = clearDeviceSelection({
              ...updatedContract,
              showNetOption:
                selectedPkg?.PackageName.startsWith("Netman Capped") ||
                selectedPkg?.PackageName.startsWith("Select"),
              packagePrice: selectedPkg?.MonthlyPrice || "",
              netOption: "",
              netAdditionalRow: false,
              packageError: "",
            });
          }
        }
      }

      if (field === "deviceName") {
        const calc = contractCalculations[index];
        if (!calc?.canSelectDevice) {
          return prevData;
        }
        const selectedDevice = devices.find((d) => d.device_name === value);
        const devicePrice = selectedDevice?.amount ?? 0;
        const selectedPkg = packages.find(
          (pkg) => pkg.PackageID === updatedContract.selectedPackage
        );
        if (
          value &&
          selectedPkg &&
          !isDeviceWithinPackageLimit(selectedPkg, devicePrice)
        ) {
          const limit = getPackageDeviceLimit(selectedPkg);
          updatedContract.deviceName = "";
          updatedContract.devicePrice = "";
          updatedContract.packageError = `Device price exceeds this package's device limit of ${formatCurrency(
            limit
          )}. Choose a cheaper device.`;
          updatedData[index] = updatedContract;
          return updatedData;
        }
        updatedContract.devicePrice = devicePrice;
        if (updatedContract.packageError?.includes("device limit")) {
          updatedContract.packageError = "";
        }
      }

      if (field === "additionalDeviceName") {
        const calc = contractCalculations[index];
        if (!calc?.canSelectDevice) {
          return prevData;
        }
        const selectedAdditionalDevice = devices.find(
          (d) => d.device_name === value
        );
        const devicePrice = selectedAdditionalDevice?.amount ?? 0;
        const selectedPkg = packages.find(
          (pkg) => pkg.PackageID === updatedContract.selectedPackage
        );
        if (
          value &&
          selectedPkg &&
          !isDeviceWithinPackageLimit(selectedPkg, devicePrice)
        ) {
          updatedContract.additionalDeviceName = "";
          updatedContract.additionalDevicePrice = "";
          updatedContract.packageError = `Additional device price exceeds this package's device limit of ${formatCurrency(
            getPackageDeviceLimit(selectedPkg)
          )}. Choose a cheaper device.`;
          updatedData[index] = updatedContract;
          return updatedData;
        }
        updatedContract.additionalDevicePrice = devicePrice;
        if (updatedContract.packageError?.includes("device limit")) {
          updatedContract.packageError = "";
        }
      }

      updatedData[index] = updatedContract;
      return updatedData;
    });
  };

  const hasSelectedPackages = contractData.some(
    (contract) => !!contract.selectedPackage
  );

  const hasValidTransactionDetails = contractData
    .filter((contract) => !!contract.selectedPackage)
    .every((contract) => {
      if (!contract.subscriptionType) return false;
      if (isRenewalTransaction(contract.subscriptionType)) {
        const msisdn = normalizeAirtimeMsisdn(contract.msisdn);
        return renewalMsisdnOptions.some((option) => option.msisdn === msisdn);
      }
      return true;
    });

  const canProceedToApplication =
    hasSelectedPackages &&
    hasValidTransactionDetails &&
    (checkLimit === "Within Limit" || totalTopUp > 0);

  const handleProceedToApplication = async () => {
    if (!canProceedToApplication) return;

    const prefillData = contractData
      .map((contract, index) => ({
        contract,
        topUp: contractCalculations[index]?.topUp || 0,
      }))
      .filter(({ contract }) => contract.selectedPackage)
      .map(({ contract, topUp }) => {
        const selectedPkg = packages.find(
          (pkg) => pkg.PackageID === contract.selectedPackage
        );
        return {
          packageName: selectedPkg?.PackageName || "",
          packageID: contract.selectedPackage,
          packagePrice: contract.packagePrice,
          deviceName: contract.deviceName || "",
          devicePrice: contract.devicePrice || "",
          subscriptionType: contract.subscriptionType || "New",
          msisdn: isRenewalTransaction(contract.subscriptionType)
            ? normalizeAirtimeMsisdn(contract.msisdn)
            : "",
          topUp,
        };
      });

    const openVoucher = (acceptsTopUp = false) => {
      onApplySimulation?.(prefillData, {
        requiresTopUp: totalTopUp > 0,
        topUpAmount: totalTopUp,
        acceptsTopUp,
      });
    };

    if (totalTopUp > 0) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Top-up Required",
        html: `
          <p style="text-align:left;margin:0 0 12px;">
            Your selected packages are within limit, but device costs exceed
            your available allowance. Total top-up required
            (monthly excess × package duration):
            <strong>${formatCurrency(totalTopUp)}</strong>.
          </p>
          <p style="text-align:left;margin:0;font-weight:600;">
            I confirm that I can top up the excess amount
          </p>
        `,
        showCancelButton: true,
        confirmButtonColor: "#0096D6",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Confirm & Continue",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
      openVoucher(true);
      return;
    }

    openVoucher(false);
  };

  const handleUpdatePendingSubmission = async () => {
    if (!isEditing || !editingSubmissionId || !canProceedToApplication) return;

    const contract = contractData[0];
    const selectedPkg = packages.find(
      (pkg) => pkg.PackageID === contract.selectedPackage
    );
    if (!selectedPkg) {
      Swal.fire({
        icon: "info",
        title: "Select a package",
        text: "Please choose a package from the current list before updating.",
      });
      return;
    }

    const subscriptionType = contract.subscriptionType || "New";
    const msisdn = isRenewalTransaction(subscriptionType)
      ? normalizeAirtimeMsisdn(contract.msisdn)
      : "";

    if (
      isRenewalTransaction(subscriptionType) &&
      !renewalMsisdnOptions.some((option) => option.msisdn === msisdn)
    ) {
      Swal.fire({
        icon: "info",
        title: "MSISDN required",
        text: AIRTIME_MSISDN_HELPER,
      });
      return;
    }

    const durationMatch = selectedPkg?.PackageName?.match(/\((\d+)\)/);
    const duration =
      durationMatch
        ? parseInt(durationMatch[1], 10)
        : Math.trunc(Number(editingSubmission?.contract_duration)) || 0;
    const devicePrice = parseFloat(contract.devicePrice) || 0;
    const monthlyDeviceCost = duration ? devicePrice / duration : 0;
    const calc = contractCalculations[0] || {};

    const result = await Swal.fire({
      icon: "question",
      title: "Update airtime benefit request?",
      html: `
        <p style="text-align:left;margin:0 0 8px;">Please confirm the new details:</p>
        <p style="text-align:left;margin:0;"><strong>Package:</strong> ${selectedPkg.PackageName}</p>
        <p style="text-align:left;margin:0;"><strong>Device:</strong> ${contract.deviceName || "No device"}</p>
        <p style="text-align:left;margin:0;"><strong>Transaction type:</strong> ${subscriptionType}</p>
        <p style="text-align:left;margin:0;"><strong>MSISDN:</strong> ${msisdn || "-"}</p>
        <p style="text-align:left;margin:0;"><strong>Package price:</strong> ${formatCurrency(calc.packageCost)}</p>
        <p style="text-align:left;margin:0;"><strong>Device price:</strong> ${formatCurrency(devicePrice)}</p>
        <p style="text-align:left;margin:0;"><strong>Monthly payment:</strong> ${formatCurrency(calc.monthly)}</p>
        <p style="text-align:left;margin:0;"><strong>Top-up:</strong> ${formatCurrency(calc.topUp || 0)}</p>
      `,
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    if ((calc.topUp || 0) > 0) {
      const topUpResult = await Swal.fire({
        icon: "warning",
        title: "Top-up Required",
        html: `
          <p style="text-align:left;margin:0 0 12px;">
            Your selected package is within limit, but device costs exceed
            your available allowance. Total top-up required:
            <strong>${formatCurrency(calc.topUp)}</strong>.
          </p>
          <p style="text-align:left;margin:0;font-weight:600;">
            I confirm that I can top up the excess amount
          </p>
        `,
        showCancelButton: true,
        confirmButtonColor: "#0096D6",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Confirm & Update",
        cancelButtonText: "Cancel",
      });
      if (!topUpResult.isConfirmed) return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/contracts/submissions/${editingSubmissionId}`, {
        PackageID: selectedPkg.PackageID,
        DisplayName: selectedPkg.PackageName,
        BaseMonthlyPrice: calc.packageCost,
        AdjustedMonthlyPrice: calc.monthly,
        ContractDuration: duration,
        SubscriptionStatus: subscriptionType,
        MSISDN: msisdn || null,
        LimitCheck: calc.packageWithinLimit ? "Within Limit" : checkLimit,
        TopUpAmount: calc.topUp || 0,
        DeviceAssigned: contract.deviceName
          ? {
              DeviceName: contract.deviceName,
              DevicePrice: devicePrice,
              MonthlyDeviceCost: monthlyDeviceCost,
              UpfrontPayment: 0,
            }
          : null,
      });

      Swal.fire({
        icon: "success",
        title: "Request updated",
        text: "Your pending airtime benefit request has been updated.",
      }).then(() => {
        if (typeof onUpdated === "function") {
          onUpdated();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error.response?.data?.message ||
          "Could not update your airtime benefit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNetOptionChange = (index, value) => {
    setContractData((prevData) => {
      const updatedData = [...prevData];
      const current = updatedData[index];
      const selectedPkg = packages.find(
        (pkg) => pkg.PackageID === current.selectedPackage
      );
      const basePackagePrice = parseFloat(selectedPkg?.MonthlyPrice) || 0;
      const packagePriceWithNet =
        value === "Yes" ? basePackagePrice + 50 : basePackagePrice;
      const remaining = getRemainingBeforeContract(index, updatedData);

      if (!isPackageWithinLimit(packagePriceWithNet, remaining)) {
        updatedData[index] = {
          ...current,
          netOption: "No",
          netAdditionalRow: false,
          packagePrice: basePackagePrice,
          packageError: `Adding Net Package would exceed your remaining allowance (${formatCurrency(
            remaining
          )}). Top-up cannot cover package overage.`,
        };
        return updatedData;
      }

      const updatedContract = {
        ...current,
        netOption: value,
        packageError: "",
      };

      if (value === "Yes") {
        updatedContract.packagePrice = packagePriceWithNet;
        updatedContract.netAdditionalRow = true;
      } else {
        updatedContract.packagePrice = basePackagePrice;
        updatedContract.netAdditionalRow = false;
        updatedContract.additionalDeviceName = "";
        updatedContract.additionalDevicePrice = "";
      }

      updatedData[index] = updatedContract;
      return updatedData;
    });
  };

  return (
    <div className={embedded ? "row g-4" : "container-main m-3 handset-simulator-page"}>
      {!embedded && (
        <div className="handset-hero mb-4">
          <div>
            <h2 className="handset-title">Airtime Benefit Simulator</h2>
            <p className="handset-subtitle mb-0">
              Simulate monthly payment across one or more contracts and check
              whether your total remains within allocation limits.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="handset-form-card d-flex align-items-center justify-content-center">
          <CircularProgress size={40} sx={{ color: "#0096D6" }} />
        </div>
      ) : (
        <div className="row g-4 w-100 m-0">
          <div className="col-12 col-xl-8">
            <form className="handset-form-card shadow-sm">
              <div className="form-header d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                <div>
                  <h5 className="mb-1">Configure your simulation</h5>
                  <p className="mb-0">
                    {isEditing
                      ? "Your current request is shown above. Choose a new package and device from the latest lists."
                      : "Device prices are auto-populated from the latest device list."}
                  </p>
                </div>
                {isEditing && canProceedToApplication && (
                  <Button
                    className="benefits-cta-btn flex-shrink-0"
                    onClick={handleUpdatePendingSubmission}
                    disabled={isSubmitting}
                    endIcon={isSubmitting ? undefined : <PostAddIcon />}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={18} sx={{ color: "white" }} />
                    ) : (
                      "Update Airtime Request"
                    )}
                  </Button>
                )}
                {!isEditing && onApplySimulation && canProceedToApplication && (
                  <Button
                    className="benefits-cta-btn flex-shrink-0"
                    onClick={handleProceedToApplication}
                    endIcon={<PostAddIcon />}
                  >
                    Proceed to Contract Application
                  </Button>
                )}
              </div>

              {(packagesError || devicesError) && (
                <Alert severity="error" className="mb-3">
                  {packagesError || devicesError}
                </Alert>
              )}

              {isEditing && (
                <div className="current-request-card">
                  <p className="current-request-label">Current pending request</p>
                  <div className="current-request-grid">
                    <div className="current-request-item">
                      <span>Current package</span>
                      <strong>
                        {editingSubmission?.PackageName ||
                          editingSubmission?.package ||
                          "-"}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current device</span>
                      <strong>
                        {editingSubmission?.DeviceName ||
                          editingSubmission?.device ||
                          "No device"}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current package price</span>
                      <strong>
                        {formatCurrency(
                          editingSubmission?.serviceplan_monthly_price ??
                            editingSubmission?.package_price
                        )}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current device price</span>
                      <strong>
                        {formatCurrency(
                          editingSubmission?.DevicePrice ??
                            editingSubmission?.device_initial_cost ??
                            editingSubmission?.device_initail_cost
                        )}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current monthly payment</span>
                      <strong>
                        {formatCurrency(
                          editingSubmission?.MonthlyPayment ??
                            pendingMonthly
                        )}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current top-up</span>
                      <strong>
                        {formatCurrency(
                          editingSubmission?.top_up_amount ??
                            editingSubmission?.TopUpAmount
                        )}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current transaction type</span>
                      <strong>
                        {editingSubmission?.transaction_type ||
                          editingSubmission?.TransactionType ||
                          "-"}
                      </strong>
                    </div>
                    <div className="current-request-item">
                      <span>Current MSISDN</span>
                      <strong>
                        {editingSubmission?.msisdn ||
                          editingSubmission?.MSISDN ||
                          "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Number of Contracts To Simulate</InputLabel>
                    <Select
                      onChange={handleNumberOfContractsChange}
                      value={numberOfContracts}
                      label="Number of Contracts To Simulate"
                      disabled={isEditing}
                    >
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="col-md-6">
                  <TextField
                    name="AirtimeAllocation"
                    label="Airtime Allocation"
                    value={formatCurrency(airtimeAllocation)}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </div>
              </div>

              {contractData.map((contract, index) => {
                const calc = contractCalculations[index] || {};
                const remainingBefore = getRemainingBeforeContract(index);
                const canSelectDevice = !!calc.canSelectDevice;
                const packageBlocksDevice =
                  !!contract.selectedPackage && calc.allowsDevice === false;
                const selectedPkg = packages.find(
                  (pkg) => pkg.PackageID === contract.selectedPackage
                );
                const deviceLimit = getPackageDeviceLimit(selectedPkg);
                const devicesForPackage =
                  deviceLimit === null
                    ? sortedDevices
                    : sortedDevices.filter(
                        (device) =>
                          (parseFloat(device.amount) || 0) <= deviceLimit
                      );

                return (
                <div key={index} className="contract-section">
                  <div className="contract-heading">Contract {index + 1}</div>

                  <div className="row">
                    <div className="col-md-6">
                      <Autocomplete
                        options={sortedPackages}
                        getOptionLabel={(option) => option?.PackageName || ""}
                        getOptionDisabled={(option) =>
                          !isPackageWithinLimit(
                            option?.MonthlyPrice,
                            remainingBefore
                          )
                        }
                        value={
                          sortedPackages.find(
                            (pkg) => pkg.PackageID === contract.selectedPackage
                          ) || null
                        }
                        onChange={(_, selectedOption) =>
                          handleContractChange(
                            index,
                            "selectedPackage",
                            selectedOption?.PackageID || ""
                          )
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.PackageID === value.PackageID
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={isEditing ? "New Package" : "Select Package"}
                            margin="normal"
                            fullWidth
                            error={!!contract.packageError}
                            helperText={
                              contract.packageError ||
                              `Packages over remaining allowance (${formatCurrency(
                                remainingBefore
                              )}) cannot be selected`
                            }
                          />
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <TextField
                        name="PackagePrice"
                        label="Package Price"
                        value={formatCurrency(contract.packagePrice)}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                        helperText={
                          isRenewalTransaction(contract.subscriptionType)
                            ? "Already running — not deducted from allowance"
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <FormControl fullWidth margin="normal">
                        <InputLabel>
                          {isEditing ? "New Transaction Type" : "Transaction Type"}
                        </InputLabel>
                        <Select
                          value={contract.subscriptionType || ""}
                          label={
                            isEditing ? "New Transaction Type" : "Transaction Type"
                          }
                          onChange={(event) =>
                            handleContractChange(
                              index,
                              "subscriptionType",
                              event.target.value
                            )
                          }
                        >
                          <MenuItem value="">
                            Select Transaction Type
                          </MenuItem>
                          {AIRTIME_TRANSACTION_TYPES.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    {isRenewalTransaction(contract.subscriptionType) && (
                      <div className="col-md-6">
                        <FormControl fullWidth margin="normal">
                          <InputLabel>
                            {isEditing ? "New MSISDN" : "MSISDN"}
                          </InputLabel>
                          <Select
                            value={
                              renewalMsisdnOptions.some(
                                (option) => option.msisdn === contract.msisdn
                              )
                                ? contract.msisdn || ""
                                : ""
                            }
                            label={isEditing ? "New MSISDN" : "MSISDN"}
                            onChange={(event) =>
                              handleContractChange(
                                index,
                                "msisdn",
                                event.target.value
                              )
                            }
                            error={
                              !!contract.msisdn &&
                              !renewalMsisdnOptions.some(
                                (option) => option.msisdn === contract.msisdn
                              )
                            }
                          >
                            <MenuItem value="">
                              {renewalMsisdnOptions.length
                                ? "Select MSISDN"
                                : "No current contracts found"}
                            </MenuItem>
                            {renewalMsisdnOptions.map((option) => (
                              <MenuItem key={option.msisdn} value={option.msisdn}>
                                {option.packageName
                                  ? `${option.msisdn} — ${option.packageName}`
                                  : option.msisdn}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <p
                          className="MuiFormHelperText-root MuiFormHelperText-sizeMedium MuiFormHelperText-contained"
                          style={{
                            margin: "3px 14px 0",
                            fontSize: "0.75rem",
                            color:
                              !!contract.msisdn &&
                              !renewalMsisdnOptions.some(
                                (option) => option.msisdn === contract.msisdn
                              )
                                ? "#d32f2f"
                                : "rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {AIRTIME_MSISDN_HELPER}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Autocomplete
                        options={devicesForPackage}
                        getOptionLabel={(option) => option?.device_name || ""}
                        getOptionDisabled={(option) =>
                          !isDeviceWithinPackageLimit(selectedPkg, option?.amount)
                        }
                        value={
                          devicesForPackage.find(
                            (device) => device.device_name === contract.deviceName
                          ) || null
                        }
                        onChange={(_, selectedOption) =>
                          handleContractChange(
                            index,
                            "deviceName",
                            selectedOption?.device_name || ""
                          )
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.device_name === value.device_name
                        }
                        disabled={!!devicesError || !canSelectDevice}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={isEditing ? "New Device Name" : "Device Name"}
                            margin="normal"
                            fullWidth
                            helperText={
                              packageBlocksDevice
                                ? "This package does not allow a device"
                                : deviceLimit !== null
                                  ? `Device price cannot exceed ${formatCurrency(
                                      deviceLimit
                                    )} for this package`
                                  : canSelectDevice
                                    ? "Device selection allowed — package is within limit"
                                    : "Select a package within limit before choosing a device"
                            }
                          />
                        )}
                      />
                    </div>

                    <div className="col-md-6">
                      <TextField
                        name="DevicePrice"
                        label={isEditing ? "New Device Price" : "Device Price"}
                        value={formatCurrency(contract.devicePrice)}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                  </div>

                  {contract.showNetOption && (
                    <div className="row">
                      <div className="col-md-6">
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Net Package</InputLabel>
                          <Select
                            value={contract.netOption || ""}
                            onChange={(e) =>
                              handleNetOptionChange(index, e.target.value)
                            }
                            label="Net Package"
                          >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  )}

                  {contract.netAdditionalRow && (
                    <>
                      <div className="row">
                        <div className="col-md-6">
                          <TextField
                            name="NetAdditionalPrice"
                            label="Additional Net Price"
                            value={formatCurrency(50)}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                          />
                        </div>
                        <div className="col-md-6">
                          <Autocomplete
                            options={devicesForPackage}
                            getOptionLabel={(option) => option?.device_name || ""}
                            value={
                              devicesForPackage.find(
                                (device) =>
                                  device.device_name ===
                                  contract.additionalDeviceName
                              ) || null
                            }
                            onChange={(_, selectedOption) =>
                              handleContractChange(
                                index,
                                "additionalDeviceName",
                                selectedOption?.device_name || ""
                              )
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.device_name === value.device_name
                            }
                            disabled={!!devicesError || !canSelectDevice}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Additional Device Name"
                                margin="normal"
                                fullWidth
                                helperText={
                                  deviceLimit !== null
                                    ? `Device price cannot exceed ${formatCurrency(
                                        deviceLimit
                                      )} for this package`
                                    : undefined
                                }
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <TextField
                            name="AdditionalDevicePrice"
                            label="Additional Device Price"
                            value={formatCurrency(contract.additionalDevicePrice)}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <TextField
                        name={`ContractMonthlyPayment-${index}`}
                        label="Contract Monthly Payment"
                        value={formatCurrency(calc.monthly || 0)}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                    {(calc.topUp || 0) > 0 && (
                      <div className="col-md-6">
                        <TextField
                          name={`Topup-${index}`}
                          label="Top Up (amount × duration)"
                          value={formatCurrency(calc.topUp || 0)}
                          fullWidth
                          margin="normal"
                          helperText="Monthly device excess × package duration"
                          sx={{
                            "& .MuiInputBase-input": {
                              color: "#d32f2f",
                              WebkitTextFillColor: "#d32f2f",
                              fontWeight: 600,
                            },
                          }}
                          InputProps={{ readOnly: true }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </form>
          </div>

          <div className="col-12 col-xl-4">
            <div className="handset-summary-card shadow-sm">
              <h6 className="summary-title">Summary</h6>
              <div className="summary-row">
                <span>Contracts simulated</span>
                <strong>{numberOfContracts}</strong>
              </div>
              <div className="summary-row">
                <span>Airtime allocation</span>
                <strong>{formatCurrency(airtimeAllocation)}</strong>
              </div>
              <div className="summary-row">
                <span>Available (after existing contracts)</span>
                <strong>{formatCurrency(limitBudget)}</strong>
              </div>
              <div className="summary-row">
                <span>Monthly payment (simulated)</span>
                <strong>{formatCurrency(monthlyPayment)}</strong>
              </div>
              <div
                className={`summary-row ${
                  remainingAfterSimulation < 0 ? "total-row-danger" : ""
                }`}
              >
                <span>Remaining after simulation</span>
                <strong>{formatCurrency(remainingAfterSimulation)}</strong>
              </div>
              {totalTopUp > 0 && (
                <div className="summary-row total-row-danger">
                  <span>Total top up</span>
                  <strong>{formatCurrency(totalTopUp)}</strong>
                </div>
              )}
              <hr className="summary-divider" />
              <div
                className={`summary-row total-row ${
                  checkLimit === "Exceeding Limit" ? "total-row-danger" : ""
                }`}
              >
                <span>Limit status</span>
                <strong>{checkLimit || "-"}</strong>
              </div>
            </div>

            <div className="handset-summary-card shadow-sm mt-3">
              <h6 className="summary-title">Tip</h6>
              <p className="simulator-tip mb-0">
                Packages over the remaining allowance cannot be selected and
                cannot use top-up. Top-up only applies when the package is
                within limit but the device pushes the total over.
              </p>
            </div>

            <div className="handset-summary-card shadow-sm mt-3 simulator-sla-notice">
              <p className="simulator-sla-text mb-3">
                <strong>NB:</strong> The SLA for requests is 24 - 48 hours. If it takes
                longer than expected, please log a follow-up ticket.
              </p>
              <Button
                className="simulator-sla-support-btn"
                startIcon={<SupportAgentIcon />}
                onClick={() => navigate("/user/Support")}
              >
                Go to User Support
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirtimeBenefitSimulator;
