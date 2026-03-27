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
} from "@mui/material";
import axiosInstance from "../../../utils/axiosInstance";
import "../../../assets/style/global/handsetBenefitSimulator.css";

const AirtimeBenefitSimulator = () => {
  const [packages, setPackages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [numberOfContracts, setNumberOfContracts] = useState(1);
  const [contractData, setContractData] = useState([
    { selectedPackage: "", devicePrice: "", deviceName: "", packagePrice: "" },
  ]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [airtimeAllocation, setAirtimeAllocation] = useState("");
  const [checkLimit, setCheckLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [packagesError, setPackagesError] = useState("");

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

  const handleNumberOfContractsChange = (event) => {
    const numContracts = parseInt(event.target.value);
    setNumberOfContracts(numContracts);

    // Adjust contractData based on the number of contracts
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
        });
      }
      return newData.slice(0, numContracts);
    });
  };

  const handleContractChange = (index, field, value) => {
    setContractData((prevData) => {
      const updatedData = [...prevData];
      const updatedContract = { ...updatedData[index], [field]: value };

      if (field === "selectedPackage") {
        const selectedPkg = packages.find((pkg) => pkg.PackageID === value);
        updatedContract.showNetOption =
          selectedPkg?.PackageName.startsWith("Netman Capped") ||
          selectedPkg?.PackageName.startsWith("Select");
        updatedContract.packagePrice = selectedPkg?.MonthlyPrice || ""; // Set the package price
      }

      if (field === "deviceName") {
        const selectedDevice = devices.find((d) => d.device_name === value);
        updatedContract.devicePrice = selectedDevice?.amount ?? 0;
      }

      if (field === "additionalDeviceName") {
        const selectedAdditionalDevice = devices.find(
          (d) => d.device_name === value
        );
        updatedContract.additionalDevicePrice =
          selectedAdditionalDevice?.amount ?? 0;
      }

      updatedData[index] = updatedContract;
      return updatedData;
    });
  };

  const handleNetOptionChange = (index, value) => {
    setContractData((prevData) => {
      const updatedData = [...prevData];
      const updatedContract = { ...updatedData[index], netOption: value };

      // Toggle additional row based on "Yes" selection
      if (value === "Yes") {
        updatedContract.packagePrice =
          parseFloat(updatedContract.packagePrice) + 50;
        updatedContract.netAdditionalRow = true;
      } else {
        // Reset if "No" is selected
        const selectedPkg = packages.find(
          (pkg) => pkg.PackageID === updatedContract.selectedPackage
        );
        updatedContract.packagePrice = selectedPkg?.MonthlyPrice || "";
        updatedContract.netAdditionalRow = false;
      }

      updatedData[index] = updatedContract;
      return updatedData;
    });
  };

  useEffect(() => {
    const calculateMonthlyPayment = () => {
      const totalMonthlyPayment = contractData.reduce((total, contract) => {
        const selectedPkg = packages.find(
          (pkg) => pkg.PackageID === contract.selectedPackage
        );
        const durationMatch = selectedPkg?.PackageName.match(/\((\d+)\)/);
        const duration = durationMatch ? parseInt(durationMatch[1], 10) : 0;
  
        // Calculate the initial device and package price
        const monthlyDevicePayment = duration
          ? contract.devicePrice / duration
          : 0;
        let packageTotal = selectedPkg?.MonthlyPrice || 0;
  
        // Add 50 if the net option is "Yes"
        if (contract.netOption === "Yes") {
          packageTotal += 50;
        }
  
        // Add additional device price if provided
        const additionalDevicePayment = duration
          ? (contract.additionalDevicePrice || 0) / duration
          : 0;
  
        // Sum up for each contract
        return total + packageTotal + monthlyDevicePayment + additionalDevicePayment;
      }, 0);
  
      setMonthlyPayment(totalMonthlyPayment);
    };
    calculateMonthlyPayment();
  }, [contractData, packages]);
  
  useEffect(() => {
    const allocation = parseFloat(airtimeAllocation) || 0;
    const limit = 0.7 * allocation;
    setCheckLimit(monthlyPayment <= limit ? "Within Limit" : "Exceeding Limit");
  }, [airtimeAllocation, monthlyPayment]);

  return (
    <div className="container-main m-3 handset-simulator-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Airtime Benefit Simulator</h2>
          <p className="handset-subtitle mb-0">
            Simulate monthly payment across one or more contracts and check
            whether your total remains within allocation limits.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="handset-form-card d-flex align-items-center justify-content-center">
          <CircularProgress size={40} sx={{ color: "#0096D6" }} />
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <form className="handset-form-card shadow-sm">
              <div className="form-header">
                <h5 className="mb-1">Configure your simulation</h5>
                <p className="mb-0">
                  Device prices are auto-populated from the latest device list.
                </p>
              </div>

              {(packagesError || devicesError) && (
                <Alert severity="error" className="mb-3">
                  {packagesError || devicesError}
                </Alert>
              )}

              <div className="row">
                <div className="col-md-6">
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Number of Contracts To Simulate</InputLabel>
                    <Select
                      onChange={handleNumberOfContractsChange}
                      value={numberOfContracts}
                      label="Number of Contracts To Simulate"
                    >
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="col-md-6">
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Airtime Allocation</InputLabel>
                    <Select
                      name="AirtimeAllocation"
                      value={airtimeAllocation}
                      onChange={(e) => setAirtimeAllocation(e.target.value)}
                      label="Airtime Allocation"
                    >
                      <MenuItem value="2200">N$ 2,200</MenuItem>
                      <MenuItem value="3300">N$ 3,300</MenuItem>
                      <MenuItem value="4400">N$ 4,400</MenuItem>
                      <MenuItem value="8000">N$ 8,000</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {contractData.map((contract, index) => (
                <div key={index} className="contract-section">
                  <div className="contract-heading">Contract {index + 1}</div>

                  <div className="row">
                    <div className="col-md-6">
                      <Autocomplete
                        options={sortedPackages}
                        getOptionLabel={(option) => option?.PackageName || ""}
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
                            label="Select Package"
                            margin="normal"
                            fullWidth
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
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Autocomplete
                        options={sortedDevices}
                        getOptionLabel={(option) => option?.device_name || ""}
                        value={
                          sortedDevices.find(
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
                        disabled={!!devicesError}
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

                    <div className="col-md-6">
                      <TextField
                        name="DevicePrice"
                        label="Device Price"
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
                            options={sortedDevices}
                            getOptionLabel={(option) => option?.device_name || ""}
                            value={
                              sortedDevices.find(
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
                            disabled={!!devicesError}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Additional Device Name"
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
                </div>
              ))}
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
                <span>Monthly payment</span>
                <strong>{formatCurrency(monthlyPayment)}</strong>
              </div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AirtimeBenefitSimulator;
