import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
} from "@mui/material";
import axiosInstance from "../../../utils/axiosInstance";
import DownloadDevicePriceList from "../../../components/user/DownloadDevicePriceList";

const AirtimeBenefitSimulator = () => {
  const [packages, setPackages] = useState([]);
  const [numberOfContracts, setNumberOfContracts] = useState(1);
  const [contractData, setContractData] = useState([
    { selectedPackage: "", devicePrice: "", deviceName: "", packagePrice: "" },
  ]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [airtimeAllocation, setAirtimeAllocation] = useState("");
  const [checkLimit, setCheckLimit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Fetching packages from /packages/packageList...");
        const response = await axiosInstance.get(`/packages/packageList?t=${Date.now()}`);
        console.log("📦 Packages response:", response.data);
        console.log("📊 Total packages received:", response.data.length);
        setPackages(response.data);
      } catch (error) {
        console.error("❌ Error fetching packages:", error);
        console.error("Error details:", error.response?.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
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
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <div className="row mb-2">
            <div className="col-lg-9">
              <h2>Airtime Benefit Simulator.</h2>
              <p>
                Don't know how much you need to use from your airtime to get
                that new phone you're looking for? Or you simply want to prepare
                yourself mentally and financially for the amount you'll pay
                monthly? Then look no further because this is where your
                questions will be answered. Please find the simulator below:
              </p>
            </div>
            <div className="col-sm-2 h-25 mt-4">
              <DownloadDevicePriceList />
            </div>
          </div>
        </div>

        {isLoading ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="400px"
            sx={{ backgroundColor: "#f5f5f5", borderRadius: 2, margin: 2 }}
          >
            <Box textAlign="center">
              <CircularProgress size={40} sx={{ color: "#0096D6" }} />
              <Typography variant="h6" sx={{ mt: 2, color: "#666" }}>
                Loading packages...
              </Typography>
            </Box>
          </Box>
        ) : (

        <div className="justify-content-center">
          <form className="form shadow p-4">
            <div className="row">
              <div className="col-md-6">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Number of Contracts To Simulate</InputLabel>
                  <Select
                    onChange={handleNumberOfContractsChange}
                    value={numberOfContracts}
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
                  >
                    <MenuItem value="2200">2200</MenuItem>
                    <MenuItem value="3300">3300</MenuItem>
                    <MenuItem value="4400">4400</MenuItem>
                    <MenuItem value="8000">8000</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            {contractData.map((contract, index) => (
              <div key={index}>
                <div className="row">
                  <div className="col-md-6">
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Select Package</InputLabel>
                      <Select
                        value={contract.selectedPackage || ""}
                        onChange={(e) =>
                          handleContractChange(
                            index,
                            "selectedPackage",
                            e.target.value
                          )
                        }
                      >
                        {packages.map((pkg) => (
                          <MenuItem key={pkg.PackageID} value={pkg.PackageID}>
                            {pkg.PackageName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  <div className="col-md-6">
                    <TextField
                      name="PackagePrice"
                      label="Package Price"
                      value={contract.packagePrice || ""}
                      fullWidth
                      margin="normal"
                      disabled
                    />
                  </div>
                </div>

                {/* Device Row Always Displayed */}
                <div className="row">
                  <div className="col-md-6">
                    <TextField
                      name="DeviceName"
                      label="Device Name"
                      value={contract.deviceName || ""}
                      onChange={(e) =>
                        handleContractChange(
                          index,
                          "deviceName",
                          e.target.value
                        )
                      }
                      fullWidth
                      margin="normal"
                    />
                  </div>

                  <div className="col-md-6">
                    <TextField
                      name="DevicePrice"
                      label="Device Price"
                      type="number"
                      value={contract.devicePrice || ""}
                      onChange={(e) =>
                        handleContractChange(
                          index,
                          "devicePrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>

                {/* Net Option Row Based on Package Selection */}
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
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                )}

                {/* Additional Row if Net Option is "Yes" */}
                {contract.netAdditionalRow && (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <TextField
                          name="NetAdditionalPrice"
                          label="Additional Net Price"
                          value={50}
                          fullWidth
                          disabled
                          margin="normal"
                        />
                      </div>
                      {/* New Device Row */}
                      <div className="col-md-6">
                        <TextField
                          name="AdditionalDeviceName"
                          label="Additional Device Name"
                          value=""
                          fullWidth
                          margin="normal"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <TextField
                          name="AdditionalDevicePrice"
                          label="Additional Device Price"
                          type="number"
                          value={contract.additionalDevicePrice || ""}
                          onChange={(e) =>
                            handleContractChange(
                              index,
                              "additionalDevicePrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          fullWidth
                          margin="normal"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="row">
              <div className="col-md-6">
                <TextField
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  name="MonthlyPayment"
                  label="Monthly Payment"
                  value={"N$ " + monthlyPayment.toFixed(2)}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </div>
              <div className="col-md-6">
                <TextField
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "red",
                    },
                  }}
                  name="CheckLimit"
                  label="Check Limit"
                  value={checkLimit}
                  fullWidth
                  margin="normal"
                  disabled
                />
              </div>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default AirtimeBenefitSimulator;
