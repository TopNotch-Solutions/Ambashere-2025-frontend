import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import Swal from "sweetalert2";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../utils/axiosInstance";

const normalizePaymentPeriod = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const match = String(value).match(/(\d+)/);
  return match ? match[1] : "";
};

const normalizeMonthlyPrice = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isNaN(parsed) ? "" : parsed;
};

const normalizeIsActive = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

const normalizeAllowsDevice = (value) => {
  if (value === undefined || value === null || value === "") return true;
  return value === true || value === 1 || value === "1" || value === "true";
};

const AddPackage = ({ open, handleClose, mode = "", packageData = {} }) => {
  const [errors, setErrors] = useState({});

  const [formValues, setFormValues] = useState({
    PackageID: "",
    PackageName: "",
    PaymentPeriod: "",
    MonthlyPrice: "",
    IsActive: true,
    AllowsDevice: true,
  });

  useEffect(() => {
    if (mode === "edit" || mode === "remove") {
      setFormValues({
        PackageID: packageData?.PackageID ?? "",
        PackageName: packageData?.PackageName ?? "",
        PaymentPeriod: normalizePaymentPeriod(packageData?.PaymentPeriod),
        MonthlyPrice: normalizeMonthlyPrice(packageData?.MonthlyPrice),
        IsActive: normalizeIsActive(packageData?.IsActive),
        AllowsDevice: normalizeAllowsDevice(packageData?.AllowsDevice),
      });
    } else if (mode === "add") {
      setFormValues({
        PackageID: "",
        PackageName: "",
        PaymentPeriod: "",
        MonthlyPrice: "",
        IsActive: true,
        AllowsDevice: true,
      });
    }
    setErrors({});
  }, [mode, packageData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      const newValues = { ...prevValues, [name]: value };

      if (name === "PackageName") {
        const match = value.match(/\((12|24|36)\)$/);
        if (match) {
          newValues.PaymentPeriod = match[1];
        }
      }

      if (name === "IsActive") {
        newValues.IsActive = value === true || value === "true";
      }

      if (name === "AllowsDevice") {
        newValues.AllowsDevice = value === true || value === "true";
      }

      return newValues;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (mode !== "remove") {
      if (!formValues.PackageName?.trim()) {
        validationErrors.PackageName = "This field is required";
      } else if (!/\((12|24|36)\)$/.test(formValues.PackageName)) {
        validationErrors.PackageName =
          "Package name must include a number in brackets (12, 24, or 36)";
      }

      if (!formValues.PaymentPeriod) {
        validationErrors.PaymentPeriod = "This field is required";
      }

      if (
        formValues.MonthlyPrice === "" ||
        formValues.MonthlyPrice === null ||
        formValues.MonthlyPrice === undefined
      ) {
        validationErrors.MonthlyPrice = "This field is required";
      }
    }

    if ((mode === "edit" || mode === "remove") && !formValues.PackageID) {
      validationErrors.PackageID = "Package ID is missing";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      PackageName: formValues.PackageName?.trim(),
      PaymentPeriod: normalizePaymentPeriod(formValues.PaymentPeriod),
      MonthlyPrice: normalizeMonthlyPrice(formValues.MonthlyPrice),
      IsActive: normalizeIsActive(formValues.IsActive),
      AllowsDevice: normalizeAllowsDevice(formValues.AllowsDevice),
    };

    try {
      let response;
      if (mode === "add") {
        response = await axiosInstance.post("/packages/createPackage", payload);
      } else if (mode === "edit") {
        response = await axiosInstance.put(
          `/packages/updatePackage/${formValues.PackageID}`,
          payload
        );
      } else if (mode === "remove") {
        response = await axiosInstance.delete(
          `/packages/removePackage/${formValues.PackageID}`
        );
      }

      if (response.status >= 200 && response.status < 300) {
        handleClose();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Package ${
            mode === "add" ? "added" : mode === "edit" ? "updated" : "deleted"
          } successfully!`,
        }).then(() => {
          window.location.reload();
        });
      } else {
        handleClose();
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: `Failed to ${
            mode === "add" ? "add" : mode === "edit" ? "update" : "delete"
          } package.`,
        });
      }
    } catch (error) {
      handleClose();
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          `Error ${
            mode === "add"
              ? "adding"
              : mode === "edit"
                ? "updating"
                : "deleting"
          } package. Please try again.`,
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          maxHeight: "95vh",
          overflow: "auto",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <form onSubmit={handleSave}>
          <div className="row">
            <div className="col">
              <h2 className="text-center">
                {mode === "add"
                  ? "Add a New Package"
                  : mode === "edit"
                    ? "Edit Package"
                    : "Delete Package"}
              </h2>
            </div>
            <div className="col-sm-1">
              <Button onClick={handleClose}>
                <CloseIcon />
              </Button>
            </div>
          </div>

          <p className="text-center">
            {mode === "remove"
              ? "Confirm you want to delete this package"
              : "Please fill in all the information below"}
          </p>

          {mode !== "add" && (
            <div className="row">
              <div className="col">
                <TextField
                  name="PackageID"
                  label="Package ID"
                  value={formValues.PackageID}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  error={!!errors.PackageID}
                  helperText={errors.PackageID}
                  disabled
                />
              </div>
            </div>
          )}

          <div className="row">
            <div className="col">
              <TextField
                name="PackageName"
                label="Package Name "
                value={formValues.PackageName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.PackageName}
                helperText={errors.PackageName}
                disabled={mode === "remove"}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <TextField
                name="MonthlyPrice"
                label="Monthly Price"
                value={formValues.MonthlyPrice}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.MonthlyPrice}
                helperText={errors.MonthlyPrice}
                disabled={mode === "remove"}
              />
            </div>

            <div className="col">
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.PaymentPeriod}
                disabled={mode === "remove"}
              >
                <InputLabel>Payment Period</InputLabel>
                <Select
                  name="PaymentPeriod"
                  value={formValues.PaymentPeriod || ""}
                  label="Payment Period"
                  onChange={handleChange}
                  disabled={mode === "remove"}
                >
                  <MenuItem value="12">12 months</MenuItem>
                  <MenuItem value="24">24 months</MenuItem>
                  <MenuItem value="36">36 months</MenuItem>
                </Select>
                {errors.PaymentPeriod && (
                  <FormHelperText>{errors.PaymentPeriod}</FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.IsActive}
                disabled={mode === "remove"}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  name="IsActive"
                  value={formValues.IsActive ? "true" : "false"}
                  label="Status"
                  onChange={handleChange}
                  disabled={mode === "remove"}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
                {errors.IsActive && (
                  <FormHelperText>{errors.IsActive}</FormHelperText>
                )}
              </FormControl>
            </div>
            <div className="col">
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.AllowsDevice}
                disabled={mode === "remove"}
              >
                <InputLabel>Allows Device</InputLabel>
                <Select
                  name="AllowsDevice"
                  value={formValues.AllowsDevice ? "true" : "false"}
                  label="Allows Device"
                  onChange={handleChange}
                  disabled={mode === "remove"}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
                {errors.AllowsDevice ? (
                  <FormHelperText>{errors.AllowsDevice}</FormHelperText>
                ) : (
                  <FormHelperText>
                    If No, users cannot add a device to this package
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          <Box mt={2}>
            <Button
              variant="contained"
              type="submit"
              style={{
                fontSize: "13px",
                height: "100%",
                backgroundColor: mode === "remove" ? "#d32f2f" : "#1A69AC",
                color: "#fff",
                padding: "8px",
                paddingLeft: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                borderColor: mode === "remove" ? "#d32f2f" : "#1A69AC",
                border: "1px solid",
              }}
            >
              {mode === "remove" ? "Delete" : "Submit"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddPackage;
