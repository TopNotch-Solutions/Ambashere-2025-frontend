import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
// Using native HTML date inputs instead of MUI X Date Pickers to avoid module resolution issues
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import Swal from "sweetalert2";

const AddHandsetModal = ({ open, handleClose, onSuccess }) => {
  const currentUser = useSelector((state) => state.auth.user);
  
  const [formData, setFormData] = useState({
    EmployeeCode: "",
    HandsetName: "",
    HandsetPrice: "",
    AccessFeePaid: "",
    RequestDate: new Date(),
    CollectionDate: null,
  });

  const [handsetOptions, setHandsetOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch options when modal opens
  useEffect(() => {
    if (open) {
      fetchHandsetOptions();
      fetchEmployeeOptions();
    }
  }, [open]);

  const fetchHandsetOptions = async () => {
    try {
      const response = await axiosInstance.get("/handsets");
      setHandsetOptions(response.data);
    } catch (error) {
      console.error("Error fetching handset options:", error);
    }
  };

  const fetchEmployeeOptions = async () => {
    try {
      const response = await axiosInstance.get("/staffmember");
      setEmployeeOptions(response.data);
    } catch (error) {
      console.error("Error fetching employee options:", error);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.EmployeeCode.trim()) {
      newErrors.EmployeeCode = "Employee Code is required";
    }


    if (!formData.HandsetName) {
      newErrors.HandsetName = "Handset Name is required";
    }

    if (!formData.HandsetPrice || formData.HandsetPrice <= 0) {
      newErrors.HandsetPrice = "Handset Price must be greater than 0";
    }

    if (formData.AccessFeePaid === "" || formData.AccessFeePaid < 0) {
      newErrors.AccessFeePaid = "Access Fee must be 0 or greater";
    }

    if (!formData.RequestDate) {
      newErrors.RequestDate = "Request Date is required";
    }

    // Validate Collection Date if provided
    if (formData.CollectionDate) {
      if (formData.CollectionDate < formData.RequestDate) {
        newErrors.CollectionDate = "Collection Date cannot be before Request Date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate status and renewal date based on collection date
      const hasCollectionDate = formData.CollectionDate !== null;
      const status = hasCollectionDate ? 'Approved' : 'Pending';
      
      let renewalDate = null;
      if (hasCollectionDate) {
        const collectionDate = new Date(formData.CollectionDate);
        renewalDate = new Date(collectionDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + 2);
      }

      const payload = {
        EmployeeCode: formData.EmployeeCode,
        AllocationID: currentUser?.AllocationID || 1, // Using currentUser's AllocationID
        HandsetName: formData.HandsetName,
        HandsetPrice: parseFloat(formData.HandsetPrice),
        AccessFeePaid: parseFloat(formData.AccessFeePaid) || 0,
        RequestDate: formData.RequestDate.toISOString().split('T')[0],
        CollectionDate: hasCollectionDate ? formData.CollectionDate.toISOString().split('T')[0] : null,
        RenewalDate: renewalDate ? renewalDate.toISOString().split('T')[0] : null,
        status: status
      };

      console.log("Submitting handset data:", payload);

      const response = await axiosInstance.post("/handsets", payload);

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Handset record created successfully!",
        });
        
        // Reset form
        setFormData({
          EmployeeCode: "",
          HandsetName: "",
          HandsetPrice: "",
          AccessFeePaid: "",
          RequestDate: new Date(),
          CollectionDate: null,
        });
        
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error creating handset record:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to create handset record",
      });
    } finally {
      setLoading(false);
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
          width: 600,
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Add New Handset Record
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Employee Code - Autocomplete with search */}
            <Autocomplete
              freeSolo
              options={employeeOptions.map((employee) => employee.EmployeeCode)}
              value={formData.EmployeeCode}
              onChange={(event, newValue) => {
                handleInputChange("EmployeeCode", newValue || "");
              }}
              onInputChange={(event, newInputValue) => {
                handleInputChange("EmployeeCode", newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee Code"
                  error={!!errors.EmployeeCode}
                  helperText={errors.EmployeeCode}
                  required
                  fullWidth
                />
              )}
            />


            {/* Handset Name - Manual text input */}
            <TextField
              label="Handset Name"
              value={formData.HandsetName}
              onChange={(e) => handleInputChange("HandsetName", e.target.value)}
              error={!!errors.HandsetName}
              helperText={errors.HandsetName}
              required
              fullWidth
            />

            {/* Handset Price */}
            <TextField
              label="Handset Price"
              type="number"
              value={formData.HandsetPrice}
              onChange={(e) => handleInputChange("HandsetPrice", e.target.value)}
              error={!!errors.HandsetPrice}
              helperText={errors.HandsetPrice}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            {/* Access Fee Paid */}
            <TextField
              label="Access Fee Paid"
              type="number"
              value={formData.AccessFeePaid}
              onChange={(e) => handleInputChange("AccessFeePaid", e.target.value)}
              error={!!errors.AccessFeePaid}
              helperText={errors.AccessFeePaid}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />


            {/* Request Date */}
            <TextField
              label="Request Date"
              type="date"
              value={formData.RequestDate ? formData.RequestDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange("RequestDate", new Date(e.target.value))}
              error={!!errors.RequestDate}
              helperText={errors.RequestDate}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Collection Date */}
            <TextField
              label="Collection Date (Optional)"
              type="date"
              value={formData.CollectionDate ? formData.CollectionDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleInputChange("CollectionDate", e.target.value ? new Date(e.target.value) : null)}
              error={!!errors.CollectionDate}
              helperText={errors.CollectionDate || "If provided, status will be 'Approved' and renewal date will be set to 2 years after collection date"}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Status Preview */}
            {formData.CollectionDate && (
              <Alert severity="info">
                Status will be set to: <strong>Approved</strong><br />
                Renewal Date will be: <strong>{new Date(new Date(formData.CollectionDate).setFullYear(new Date(formData.CollectionDate).getFullYear() + 2)).toLocaleDateString()}</strong>
              </Alert>
            )}

            {!formData.CollectionDate && (
              <Alert severity="warning">
                Status will be set to: <strong>Pending</strong> (until collection date is provided)
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#0096D6",
                  "&:hover": { backgroundColor: "#1A69AC" }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating...
                  </>
                ) : (
                  "Create Record"
                )}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddHandsetModal;
