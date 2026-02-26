import React, { useEffect, useState } from "react";
import { TextField, FormControl, MenuItem, Select, InputLabel } from "@mui/material";
import DownloadDevicePriceList from "../../../components/user/DownloadDevicePriceList";

const HandsetBenfitSimulator = () => {
  const [deviceName, setDeviceName] = useState("");
  const [devicePrice, setDevicePrice] = useState("");
  const [topupPayment, setTopupPayment] = useState(0); // Initial topupPayment
  const [handsetAllocation, setHandsetAllocation] = useState("");

  // Handle device name change
  const handleDeviceNameChange = (event) => {
    setDeviceName(event.target.value);
  };

  // Handle device price change
  const handleDevicePriceChange = (event) => {
    setDevicePrice(parseFloat(event.target.value) || 0);
  };

  // Handle airtime allocation change
  const handleHandsetAllocationChange = (event) => {
    setHandsetAllocation(event.target.value);
  };

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
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <div className="row mb-2">
                      <div className="col-lg-9">
                        <h2>Handset Benefit Simulator.</h2>
                        <p>
                           Don't know how much you need to use from your handset benefit to get
            that new phone you're looking for? Or you simply want to prepare
            yourself mentally and financially for the amount you'll pay once-off
            and the amount you'll need for the top-up? Then look no further
            because this is where your questions will be answered. Please find
            the simulator below:
                        </p>
                      </div>
                      <div className="col-sm-2 h-25 mt-4">
                        <DownloadDevicePriceList />
                      </div>
                    </div>
         
        </div>

        <div className="justify-content-center">
          <form className="form shadow p-4">
            {/* <div className="row">
            <div className="col">
              <h2 className="text-center">Calculate your benefits</h2>
            </div>
          </div>

          <p className="text-center">
            Please fill in all the information below
          </p> */}

            <div className="row">
              <div className="col-md-6">
                <FormControl fullWidth margin="normal">
                  <InputLabel>Handset Allocation</InputLabel>
                  <Select
                    name="HandsetAllocation"
                    value={handsetAllocation}
                    onChange={handleHandsetAllocationChange}
                  >
                    <MenuItem value="8000">8000</MenuItem>
                    <MenuItem value="9000">9000</MenuItem>
                    <MenuItem value="10000">10000</MenuItem>
                    <MenuItem value="12000">12000</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* <div className="col-md-6">
                <TextField
                  name="HandsetAllocation"
                  label="Handset Allocation"
                  type="number"
                  value={handsetAllocation}
                  onChange={handleHandsetAllocationChange}
                  fullWidth
                  margin="normal"
                />
              </div> */}

              <div className="col-md-6">
                <TextField
                  name="DeviceName"
                  label="Device Name"
                  value={deviceName}
                  onChange={handleDeviceNameChange}
                  fullWidth
                  margin="normal"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <TextField
                  name="DevicePrice"
                  label="Device Price"
                  type="number"
                  value={devicePrice}
                  onChange={handleDevicePriceChange}
                  fullWidth
                  margin="normal"
                />
              </div>

              <div className="col-md-6">
                <TextField
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                    },
                  }}
                  name="Topup"
                  label="Access Payment"
                  fullWidth
                  margin="normal"
                  disabled
                  value={"N$ " + topupPayment}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HandsetBenfitSimulator;
