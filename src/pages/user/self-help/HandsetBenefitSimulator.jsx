import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import PostAddIcon from "@mui/icons-material/PostAdd";
import axiosInstance from "../../../utils/axiosInstance.jsx";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";

const HandsetBenfitSimulator = ({ embedded = false, onSubmitted }) => {
  const [deviceName, setDeviceName] = useState("");
  const [devicePrice, setDevicePrice] = useState("");
  const [topupPayment, setTopupPayment] = useState(0); // Initial topupPayment
  const [handsetAllocation, setHandsetAllocation] = useState("");
  const [devices, setDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [eligibility, setEligibility] = useState({
    canApply: false,
    canEditPending: false,
    pendingSubmission: null,
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const employeeCode = currentUser?.EmployeeCode;
  const sortedDevices = useMemo(
    () =>
      [...devices].sort((a, b) =>
        (a?.device_name || "").localeCompare(b?.device_name || "")
      ),
    [devices]
  );
  const selectedDevice = devices.find((d) => d.device_name === deviceName);

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return `N$ ${numberValue.toLocaleString("en-NA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoadingDevices(true);
        setDevicesError("");
        const response = await axiosInstance.get(
          "/pricelist/device-price-list"
        );
        const list = (response?.data?.data || []).filter((device) => {
          const group = String(device.device_group || "")
            .trim()
            .toLowerCase();
          if (group !== "cell phones") return false;

          const name = String(device.device_name || "");
          return !/tab|tablet|ipad|watch/i.test(name);
        });
        setDevices(list);
      } catch (error) {
        console.error("Failed to load device price list", error);
        setDevicesError("Unable to load device price list.");
      } finally {
        setIsLoadingDevices(false);
      }
    };

    fetchDevices();
  }, []);

  // Handle device name change
  const handleDeviceNameChange = (selectedName) => {
    setDeviceName(selectedName);

    const match = devices.find(
      (device) => device.device_name === selectedName
    );
    if (match) {
      setDevicePrice(match.staff_discounted_amount ?? match.amount ?? 0);
    } else {
      setDevicePrice(0);
    }
  };

  useEffect(() => {
    const fetchHandsetAllocation = async () => {
      if (!employeeCode) return;

      try {
        const response = await axiosInstance.get(
          `/staffmember/staff/handset-allocation/${employeeCode}`
        );
        const allocation = response?.data?.myAllocation?.HandsetAllocation || 0;
        setHandsetAllocation(allocation);
      } catch (error) {
        console.error("Failed to load handset allocation", error);
        setHandsetAllocation(0);
      }
    };

    fetchHandsetAllocation();
  }, [employeeCode]);

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!employeeCode) return;
      try {
        const response = await axiosInstance.get(
          `/handsets/submissions/eligibility/${employeeCode}`
        );
        setEligibility({
          canApply: Boolean(response?.data?.canApply),
          canEditPending: Boolean(response?.data?.canEditPending),
          pendingSubmission: response?.data?.pendingSubmission || null,
          reason: response?.data?.reason || "",
        });
      } catch (error) {
        console.error("Failed to load handset eligibility", error);
        setEligibility({
          canApply: false,
          canEditPending: false,
          pendingSubmission: null,
          reason: "Unable to confirm whether you can apply for a staff handset.",
        });
      }
    };

    fetchEligibility();
  }, [employeeCode]);

  // Calculate and set topUpPayment on any input change
  useEffect(() => {
    const calculateTopUpPayment = () => {
      const newTopUpPayment =
        devicePrice >= handsetAllocation ? devicePrice - handsetAllocation : 0;
      setTopupPayment(newTopUpPayment);
    };
    calculateTopUpPayment();
  }, [devicePrice, handsetAllocation]);

  const handleSubmitApplication = async () => {
    if (!deviceName) {
      Swal.fire({
        icon: "info",
        title: "Select a device",
        text: "Please choose a cell phone before submitting your request.",
      });
      return;
    }

    const isEditing = Boolean(
      eligibility.canEditPending && eligibility.pendingSubmission?.id
    );

    if (!eligibility.canApply && !isEditing) {
      Swal.fire({
        icon: "warning",
        title: "Not eligible",
        text: eligibility.reason || "You cannot apply for a staff handset at this time.",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: isEditing
        ? "Update staff handset request?"
        : "Submit staff handset request?",
      html: `
        <p style="text-align:left;margin:0 0 8px;">Please confirm the details below:</p>
        <p style="text-align:left;margin:0;"><strong>Employee:</strong> ${currentUser?.FullName || "-"} (${employeeCode || "-"})</p>
        <p style="text-align:left;margin:0;"><strong>Device:</strong> ${deviceName}</p>
        <p style="text-align:left;margin:0;"><strong>Device price:</strong> ${formatCurrency(devicePrice)}</p>
        <p style="text-align:left;margin:0;"><strong>Excess payment:</strong> ${formatCurrency(topupPayment)}</p>
      `,
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isEditing ? "Yes, update" : "Yes, submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const payload = {
        EmployeeCode: employeeCode,
        employee_name: currentUser?.FullName,
        device: deviceName,
        device_price: Number(devicePrice) || 0,
        excess_payment: Number(topupPayment) || 0,
      };

      let savedSubmission = eligibility.pendingSubmission;
      if (isEditing) {
        await axiosInstance.put(
          `/handsets/submissions/${eligibility.pendingSubmission.id}`,
          payload
        );
        savedSubmission = {
          ...eligibility.pendingSubmission,
          device: deviceName,
          device_price: Number(devicePrice) || 0,
          excess_payment: Number(topupPayment) || 0,
        };
      } else {
        const response = await axiosInstance.post("/handsets/submissions", payload);
        savedSubmission = response?.data?.submission || {
          device: deviceName,
          device_price: Number(devicePrice) || 0,
          excess_payment: Number(topupPayment) || 0,
        };
      }

      setEligibility({
        canApply: false,
        canEditPending: true,
        pendingSubmission: savedSubmission,
        reason:
          "You have a pending staff handset request. You can still edit the device until an administrator starts processing it.",
      });
      setDeviceName("");
      setDevicePrice("");

      Swal.fire({
        icon: "success",
        title: isEditing ? "Request updated" : "Request submitted",
        text: isEditing
          ? "Your pending staff handset request has been updated."
          : "Your staff handset request has been submitted and is pending review.",
      }).then(() => {
        if (typeof onSubmitted === "function") {
          onSubmitted();
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isEditing ? "Update failed" : "Submission failed",
        text:
          error.response?.data?.message ||
          (isEditing
            ? "Could not update your staff handset request. Please try again."
            : "Could not submit your staff handset request. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={embedded ? "row g-4" : "container-main m-3 handset-simulator-page"}>
      {!embedded && (
        <div className="handset-hero mb-4">
          <div>
            <h2 className="handset-title">Handset Benefit Simulator</h2>
            <p className="handset-subtitle mb-0">
              Select your handset allocation and preferred device to instantly see
              your estimated once-off excess payment.
            </p>
          </div>
        </div>
      )}

      <div className="row g-4 w-100 m-0">
        <div className="col-12 col-xl-8">
          <form className="handset-form-card shadow-sm">
            <div className="form-header d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
              <div>
                <h5 className="mb-1">Calculate your handset contribution</h5>
                <p className="mb-0">
                  {eligibility.canEditPending
                    ? "Your current request is shown above. Choose a new device from the latest price list."
                    : "Values update automatically based on the selected device list."}
                </p>
              </div>
              {(eligibility.canApply || eligibility.canEditPending) && deviceName && (
                <Button
                  className="benefits-cta-btn flex-shrink-0"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || isLoadingDevices}
                  endIcon={isSubmitting ? undefined : <PostAddIcon />}
                >
                  {isSubmitting ? (
                    <CircularProgress size={18} sx={{ color: "white" }} />
                  ) : eligibility.canEditPending ? (
                    "Update Handset Request"
                  ) : (
                    "Submit Handset Request"
                  )}
                </Button>
              )}
            </div>

            {devicesError && (
              <p className="simulator-notice simulator-notice-error mb-3">
                {devicesError}
              </p>
            )}
            {eligibility.reason && (
              <p
                className={`simulator-notice mb-3 ${
                  eligibility.canApply || eligibility.canEditPending
                    ? "simulator-notice-info"
                    : "simulator-notice-muted"
                }`}
              >
                {eligibility.reason}
              </p>
            )}

            {eligibility.canEditPending && eligibility.pendingSubmission && (
              <div className="current-request-card">
                <p className="current-request-label">Current pending request</p>
                <div className="current-request-grid">
                  <div className="current-request-item">
                    <span>Current device</span>
                    <strong>{eligibility.pendingSubmission.device || "-"}</strong>
                  </div>
                  <div className="current-request-item">
                    <span>Current device price</span>
                    <strong>
                      {formatCurrency(eligibility.pendingSubmission.device_price)}
                    </strong>
                  </div>
                  <div className="current-request-item">
                    <span>Current excess payment</span>
                    <strong>
                      {formatCurrency(eligibility.pendingSubmission.excess_payment)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-md-6">
                <TextField
                  name="HandsetAllocation"
                  label="Handset Allocation"
                  value={formatCurrency(handsetAllocation)}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </div>

              <div className="col-md-6">
                <Autocomplete
                  options={sortedDevices}
                  getOptionLabel={(option) => option?.device_name || ""}
                  value={
                    sortedDevices.find(
                      (device) => device.device_name === deviceName
                    ) || null
                  }
                  onChange={(_, selectedOption) =>
                    handleDeviceNameChange(selectedOption?.device_name || "")
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.device_name === value.device_name
                  }
                  disabled={isLoadingDevices || !!devicesError}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        eligibility.canEditPending
                          ? "New Device Name"
                          : "Device Name"
                      }
                      margin="normal"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <TextField
                  name="DevicePrice"
                  label={
                    eligibility.canEditPending
                      ? "New Device Price (Staff Discounted)"
                      : "Device Price (Staff Discounted)"
                  }
                  type="text"
                  value={formatCurrency(devicePrice)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>

              <div className="col-md-6">
                <TextField
                  name="Topup"
                  label={
                    eligibility.canEditPending ? "New Excess Payment" : "Excess Payment"
                  }
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiInputBase-input": {
                      color: topupPayment > 0 ? "#d32f2f" : "#22354d",
                      WebkitTextFillColor: topupPayment > 0 ? "#d32f2f" : "#22354d",
                      fontWeight: 600,
                    },
                  }}
                  InputProps={{
                    readOnly: true,
                  }}
                  value={formatCurrency(topupPayment)}
                />
              </div>
            </div>

            <p className="simulator-note mb-0">
              Excess Payment = Device Price - Handset Allocation (minimum N$
              0.00)
            </p>
          </form>
        </div>

        <div className="col-12 col-xl-4">
          <div className="handset-summary-card shadow-sm">
            <h6 className="summary-title">Summary</h6>
            <div className="summary-row">
              <span>Selected device</span>
              <strong>{deviceName || "Not selected"}</strong>
            </div>
            <div className="summary-row">
              <span>Device group</span>
              <strong>{selectedDevice?.device_group || "-"}</strong>
            </div>
            <div className="summary-row">
              <span>Allocation</span>
              <strong>{formatCurrency(handsetAllocation)}</strong>
            </div>
            <div className="summary-row">
              <span>Device price</span>
              <strong>{formatCurrency(devicePrice)}</strong>
            </div>
            <hr className="summary-divider" />
            <div className={`summary-row total-row ${topupPayment > 0 ? "total-row-danger" : ""}`}>
              <span>Excess payment</span>
              <strong>{formatCurrency(topupPayment)}</strong>
            </div>
          </div>

          <div className="handset-summary-card shadow-sm mt-3">
            <h6 className="summary-title">Tip</h6>
            <p className="simulator-tip mb-0">
              A staff handset is available after two years and applies to
              cell phones only. Tablets, watches, and similar devices are not
              covered under this benefit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandsetBenfitSimulator;
