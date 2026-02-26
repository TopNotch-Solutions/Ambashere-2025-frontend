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

const AddPackage = ({ open, handleClose, mode = "", packageData = {} }) => {
  const [errors, setErrors] = useState({});

  const [formValues, setFormValues] = useState({
    PackageID: "",
    PackageName: "",
    PaymentPeriod: "",
    MonthlyPrice: "",
    IsActive: true,
  });

  useEffect(() => {
    if (mode === "edit" || mode === "remove") {
       console.log("Loaded packageData:", packageData);
       console.log("Loaded packageData:", mode);
      setFormValues(packageData);
    }
  }, [mode, packageData]);

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

      return newValues;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let validationErrors = {};
  
    // Check required fields
    for (const [key, value] of Object.entries(formValues)) {
      if (!value && key !== "PackageID") {
        validationErrors[key] = "This field is required";
      }
    }
  
    // Validate package name format
    if (!/\((12|24|36)\)$/.test(formValues.PackageName)) {
      validationErrors.PackageName =
        "Package name must include a number in brackets (12, 24, or 36)";
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      let response;
      if (mode === "add") {
        response = await axiosInstance.post("/packages/createPackage", formValues);
      } else if (mode === "edit") {
        console.log("Attempting to edit:");
        response = await axiosInstance.put(
          `/packages/updatePackage/${formValues.PackageID}`,
          formValues
        );
        console.log("My response: ",response);
      } else if (mode === "remove") {
         console.log("Attempting to delete:");
        response = await axiosInstance.delete(`/packages/removePackage/${formValues.PackageID}`);
         console.log("My response: ",response);
      }
  
      // Adjust the success status codes to be more flexible
      if (response.status >= 200 && response.status < 300) {
        handleClose(); // Close the modal before showing the success popup
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Package ${
            mode === "add" ? "added" : mode === "edit" ? "updated" : "deleted"
          } successfully!`,
        }).then(() => {
        window.location.reload(); // Reload after user clicks OK
      });
      } else {
        handleClose(); // Close the modal before showing the error popup
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: `Failed to ${
            mode === "add" ? "add" : mode === "edit" ? "update" : "delete"
          } package.`,
        });
      }
    } catch (error) {
      handleClose(); // Close the modal before showing the error popup
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error ${
          mode === "add" ? "adding" : mode === "edit" ? "updating" : "deleting"
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
                {mode === "add" ? "Add a New Package" : mode === "edit" ? "Edit Package" : "Delete Package"}
              </h2>
            </div>
            <div className="col-sm-1">
              <Button onClick={handleClose}>
                <CloseIcon />
              </Button>
            </div>
          </div>

          <p className="text-center">
            Please fill in all the information below
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

          {/* Row 1: Package Name */}
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

          {/* Row 2: Monthly Price & Payment Period*/}
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
                  value={formValues.PaymentPeriod}
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

          {/* Row 3: IsActive Status */}
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
                  value={formValues.IsActive}
                  onChange={handleChange}
                  disabled={mode === "remove"}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
                {errors.IsActive && (
                  <FormHelperText>{errors.IsActive}</FormHelperText>
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
                backgroundColor: "#1A69AC",
                color: "#fff",
                padding: "8px",
                paddingLeft: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                borderColor: "#1A69AC",
                border: "1px solid",
              }}
            //   disabled={mode === "remove"}
            >
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddPackage;
