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
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import "../../../assets/style/global/handsetBenefitSimulator.css";

const AirtimeBenefitSimulator = ({ embedded = false, onApplySimulation }) => {
  const [packages, setPackages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [numberOfContracts, setNumberOfContracts] = useState(1);
  const [contractData, setContractData] = useState([
    { selectedPackage: "", devicePrice: "", deviceName: "", packagePrice: "" },
  ]);
  const [airtimeAllocation, setAirtimeAllocation] = useState("");
  const [availableAllowance, setAvailableAllowance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devicesError, setDevicesError] = useState("");
  const [packagesError, setPackagesError] = useState("");
  const currentUser = useSelector((state) => state.auth.user);
  const employeeCode = currentUser?.EmployeeCode;

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
      } catch (error) {
        console.error("Failed to load available allowance", error);
      }
    };

    fetchAvailableAllowance();
  }, [employeeCode]);

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

  const getContractMonthlyPayment = (contract) =>
    getPackageMonthlyCost(contract) + getDeviceMonthlyCost(contract);

  const limitBudget = useMemo(() => {
    if (availableAllowance !== null) {
      return parseFloat(availableAllowance) || 0;
    }
    return 0.7 * (parseFloat(airtimeAllocation) || 0);
  }, [availableAllowance, airtimeAllocation]);

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

  const contractCalculations = useMemo(() => {
    let remaining = limitBudget;

    return contractData.map((contract) => {
      const selectedPkg = packages.find(
        (pkg) => pkg.PackageID === contract.selectedPackage
      );
      const packageCost = getPackageMonthlyCost(contract);
      const allowsDevice = packageAllowsDevice(selectedPkg);
      const deviceCost = allowsDevice ? getDeviceMonthlyCost(contract) : 0;
      const monthly = packageCost + deviceCost;
      const packageWithinLimit = isPackageWithinLimit(packageCost, remaining);

      // Top-up only when package itself is within limit but device pushes over
      let topUp = 0;
      if (packageWithinLimit && allowsDevice && monthly > remaining) {
        topUp = monthly - remaining;
      }

      remaining = Math.max(0, remaining - monthly);

      return {
        monthly,
        packageCost,
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

          if (!isPackageWithinLimit(packagePrice, remaining)) {
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
        updatedContract.devicePrice = selectedDevice?.amount ?? 0;
      }

      if (field === "additionalDeviceName") {
        const calc = contractCalculations[index];
        if (!calc?.canSelectDevice) {
          return prevData;
        }
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

  const hasSelectedPackages = contractData.some(
    (contract) => !!contract.selectedPackage
  );

  const canProceedToApplication =
    hasSelectedPackages &&
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
          subscriptionType: "New",
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
            your available allowance by
            <strong>${formatCurrency(totalTopUp)}</strong>. Top-up can cover
            this device excess.
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
                    Device prices are auto-populated from the latest device list.
                  </p>
                </div>
                {onApplySimulation && canProceedToApplication && (
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
                            label="Select Package"
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
                        disabled={!!devicesError || !canSelectDevice}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Device Name"
                            margin="normal"
                            fullWidth
                            helperText={
                              packageBlocksDevice
                                ? "This package does not allow a device"
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
                            disabled={!!devicesError || !canSelectDevice}
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
                          label="Top Up (device excess only)"
                          value={formatCurrency(calc.topUp || 0)}
                          fullWidth
                          margin="normal"
                          helperText="Top-up only covers device cost that exceeds the remaining limit"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AirtimeBenefitSimulator;
