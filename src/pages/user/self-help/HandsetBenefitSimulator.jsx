import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  Alert,
} from "@mui/material";
import axiosInstance from "../../../utils/axiosInstance.jsx";
import { useSelector } from "react-redux";
import "../../../assets/style/global/handsetBenefitSimulator.css";

const HandsetBenfitSimulator = ({ embedded = false }) => {
  const [deviceName, setDeviceName] = useState("");
  const [devicePrice, setDevicePrice] = useState("");
  const [topupPayment, setTopupPayment] = useState(0); // Initial topupPayment
  const [handsetAllocation, setHandsetAllocation] = useState("");
  const [devices, setDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [devicesError, setDevicesError] = useState("");
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
        const list = response?.data?.data || [];
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

  // Calculate and set topUpPayment on any input change
  useEffect(() => {
    const calculateTopUpPayment = () => {
      const newTopUpPayment =
        devicePrice >= handsetAllocation ? devicePrice - handsetAllocation : 0;
      setTopupPayment(newTopUpPayment);
    };
    calculateTopUpPayment();
  }, [devicePrice, handsetAllocation]);

  return (
    <div className={embedded ? "row g-4" : "container-main m-3 handset-simulator-page"}>
      {!embedded && (
        <div className="handset-hero mb-4">
          <div>
            <h2 className="handset-title">Handset Benefit Simulator</h2>
            <p className="handset-subtitle mb-0">
              Select your handset allocation and preferred device to instantly see
              your estimated once-off access payment.
            </p>
          </div>
        </div>
      )}

      <div className="row g-4 w-100 m-0">
        <div className="col-12 col-xl-8">
          <form className="handset-form-card shadow-sm">
            <div className="form-header">
              <h5 className="mb-1">Calculate your handset contribution</h5>
              <p className="mb-0">
                Values update automatically based on the selected device list.
              </p>
            </div>

            {devicesError && (
              <Alert severity="error" className="mb-3">
                {devicesError}
              </Alert>
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
                      label="Device Name"
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
                  label="Device Price (Staff Discounted)"
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
                  label="Access Payment"
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
              Access Payment = Device Price - Handset Allocation (minimum N$
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
              <span>Access payment</span>
              <strong>{formatCurrency(topupPayment)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandsetBenfitSimulator;
