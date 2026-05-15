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

const INITIAL_FORM_VALUES = {
  EmployeeCode: "",
  FirstName: "",
  LastName: "",
  FullName: "",
  UserName: "",
  Email: "",
  PhoneNumber: "",
  Gender: "",
  ServicePlan: "",
  Position: "",
  Department: "",
  Division: "",
  EmploymentCategory: "",
  EmploymentStatus: "Active",
  RoleID: "",
  AllocationID: "",
};

const FORM_FIELD_KEYS = Object.keys(INITIAL_FORM_VALUES);

const mapEmployeeToForm = (employee = {}) => {
  const mapped = { ...INITIAL_FORM_VALUES };

  FORM_FIELD_KEYS.forEach((key) => {
    const value = employee[key];
    if (value != null && value !== "") {
      mapped[key] = value;
    }
  });

  if (employee.RoleID != null && employee.RoleID !== "") {
    mapped.RoleID = String(employee.RoleID);
  }
  if (employee.AllocationID != null && employee.AllocationID !== "") {
    mapped.AllocationID = String(employee.AllocationID);
  }

  if (!mapped.FirstName && mapped.FullName) {
    const nameParts = mapped.FullName.trim().split(/\s+/);
    mapped.FirstName = nameParts[0] || "";
    mapped.LastName = nameParts.slice(1).join(" ") || "";
  }

  return mapped;
};

const AddEmployee = ({
  open,
  handleClose,
  mode = "",
  employeeData = {},
  onSuccess,
}) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [originalEmployeeCode, setOriginalEmployeeCode] = useState("");
  var phoneNumberRegex = /^(81\d{7}|081\d{7}|26481\d{7}|\+26481\d{7})$/;

  const employmentCategories = [
    { value: "Permanent", label: "Permanent" },
    { value: "Temporary", label: "Temporary" },
    { value: "Retired", label: "Retired" },
  ];

  const employementCategoryOptions = {
    Permanent: [
      { value: "1", label: "General Staff" },
      { value: "2", label: "Technicians" },
      { value: "3", label: "Middle Management" },
      { value: "4", label: "Chief/General Manager" },
    ],
    Temporary: [{ value: "5", label: "Temporary Staff" }],
    Retired: [{ value: "6", label: "Retiree" }],
  };

  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);

  useEffect(() => {
    if (!open) return;

    const loadEmployeeForm = async () => {
      setErrors({});

      if (mode === "add") {
        setFormValues(INITIAL_FORM_VALUES);
        setOriginalEmployeeCode("");
        setLoading(false);
        return;
      }

      const employeeCode = employeeData?.EmployeeCode;
      if (!employeeCode) return;

      setLoading(true);
      setOriginalEmployeeCode(employeeCode);

      try {
        const response = await axiosInstance.get(`/staffmember/${employeeCode}`);
        const mapped = mapEmployeeToForm(response.data);
        if (mode === "inactive") {
          mapped.EmploymentStatus = "Inactive";
        }
        setFormValues(mapped);
      } catch {
        const mapped = mapEmployeeToForm(employeeData);
        if (mode === "inactive") {
          mapped.EmploymentStatus = "Inactive";
        }
        setFormValues(mapped);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeForm();
  }, [open, mode, employeeData?.EmployeeCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => {
      let newValues = { ...prevValues, [name]: value };

      if (name === "EmploymentCategory") {
        const newAllocationID =
          employementCategoryOptions[value]?.[0]?.value || ""; // Set default value if available
        newValues = {
          ...newValues,
          EmploymentCategory: value,
          AllocationID: newAllocationID,
        };
      }

      if (name === "PhoneNumber") {
        const formattedPhoneNumber = validatePhoneNumber(value);
        newValues = { ...newValues, [name]: formattedPhoneNumber };
      }

      // Autofill email and username when adding a new employee
      if (mode === "add" && (name === "FirstName" || name === "LastName")) {
        const firstName = name === "FirstName" ? value : prevValues.FirstName;
        const lastName = name === "LastName" ? value : prevValues.LastName;

        if (firstName && lastName) {
          newValues.Email = `${firstName[0].toLowerCase()}${lastName
            .trim()
            .toLowerCase()}@mtc.com.na`;
          newValues.UserName = `${lastName
            .trim()
            .toLowerCase()}${firstName.trim().toLowerCase()}`;
          newValues.FullName = `${firstName} ${lastName}`;
        }
      }

      return newValues;
    });
  };

  const getAllocationOptions = () => {
    return employementCategoryOptions[formValues.EmploymentCategory] || [];
  };

  const validatePhoneNumber = (PhoneNumber) => {
    if (phoneNumberRegex.test(PhoneNumber)) {
      // Number is in a valid form, format it if necessary
      if (PhoneNumber.startsWith("081")) {
        return "+264" + PhoneNumber.substring(1);
      } else if (PhoneNumber.startsWith("26481")) {
        return "+" + PhoneNumber;
      } else if (PhoneNumber.startsWith("81")) {
        return "+264" + PhoneNumber;
      } else if (PhoneNumber.startsWith("+26481")) {
        return PhoneNumber;
      } else {
        return PhoneNumber;
      }
    } else {
      // Number is not valid, return original input
      return PhoneNumber;
    }
  };

  const buildPayload = (values) => {
    const payload = {};
    FORM_FIELD_KEYS.forEach((key) => {
      payload[key] = values[key];
    });
    return payload;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    const payload = buildPayload(formValues);

    if (mode === "inactive") {
      if (!payload.EmployeeCode) {
        validationErrors.EmployeeCode = "This field is required";
      }
    } else {
      FORM_FIELD_KEYS.forEach((key) => {
        if (key !== "EmploymentStatus" && !payload[key]) {
          validationErrors[key] = "This field is required";
        }
      });

      const formattedPhoneNumber = validatePhoneNumber(payload.PhoneNumber);
      if (!phoneNumberRegex.test(formattedPhoneNumber)) {
        validationErrors.PhoneNumber = "Please enter a valid phone number.";
      } else {
        payload.PhoneNumber = formattedPhoneNumber;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      let response;
      if (mode === "add") {
        response = await axiosInstance.post(
          "/staffmember/createStaff",
          payload
        );
      } else if (mode === "edit") {
        const updateCode = originalEmployeeCode || payload.EmployeeCode;
        response = await axiosInstance.put(
          `/staffmember/updateStaff/${updateCode}`,
          payload
        );
      } else if (mode === "inactive") {
        response = await axiosInstance.put(
          `/staffmember/removeStaff/${payload.EmployeeCode}`,
          { EmploymentStatus: "Inactive" }
        );
      }

      if (response?.status >= 200 && response?.status < 300) {
        if (onSuccess) {
          onSuccess();
        } else {
          handleClose();
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Employee ${
            mode === "add"
              ? "added"
              : mode === "edit"
              ? "updated"
              : "set to inactive"
          } successfully!`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: `Failed to ${
            mode === "add"
              ? "add"
              : mode === "edit"
              ? "update"
              : "set to inactive"
          } employee.`,
        });
      }
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          apiMessage ||
          `Error ${
            mode === "add"
              ? "adding"
              : mode === "edit"
              ? "updating"
              : "setting to inactive"
          } employee. Please try again.`,
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
          {loading && (
            <p className="text-center">Loading employee details...</p>
          )}
          <div className="row">
            <div className="col">
              <h2 className="text-center">
                {mode === "add"
                  ? "Add a New Employee"
                  : mode === "edit"
                  ? "Edit Employee"
                  : "Set Employee to Inactive"}
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
          {/* Row 1: Employee Code & First Name */}
          <div className="row">
            <div className="col">
              <TextField
                name="EmployeeCode"
                label="Employee Code"
                value={formValues.EmployeeCode}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.EmployeeCode}
                helperText={errors.EmployeeCode}
                disabled={mode === "inactive"}
              />
            </div>

            <div className="col">
              <TextField
                name="FirstName"
                label="First Name"
                value={formValues.FirstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.FirstName}
                helperText={errors.FirstName}
                disabled={mode === "inactive"}
              />
            </div>
          </div>

          {/* Row 2: Last Name & Full Name */}
          <div className="row">
            <div className="col">
              <TextField
                name="LastName"
                label="Last Name"
                value={formValues.LastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.LastName}
                helperText={errors.LastName}
                disabled={mode === "inactive"}
              />
            </div>

            <div className="col">
              {" "}
              <TextField
                name="FullName"
                label="Full Name"
                value={
                  mode === "add"
                    ? `${formValues.FirstName} ${formValues.LastName}`.trim()
                    : formValues.FullName
                }
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.FullName}
                helperText={errors.FullName}
                disabled={mode !== "edit"}
                sx={{
                  color: "black",
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col">
              {" "}
              <TextField
                name="UserName"
                label="User Name"
                value={
                  mode === "add"
                    ? `${formValues.LastName}${formValues.FirstName.charAt(0) || ""}`
                    : formValues.UserName
                }
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.UserName}
                helperText={errors.UserName}
                disabled={mode !== "edit"}
                sx={{
                  color: "black",
                }}
              />
            </div>

            <div className="col">
              <TextField
                name="Email"
                label="Email"
                value={formValues.Email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.Email}
                helperText={errors.Email}
                disabled={mode !== "edit"}
              />
            </div>
          </div>

          {/* Row 3: Email & Phone Number */}
          <div className="row">
            <div className="col">
              {" "}
              <TextField
                name="PhoneNumber"
                label="Phone Number"
                value={formValues.PhoneNumber}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.PhoneNumber}
                helperText={errors.PhoneNumber}
                disabled={mode === "inactive"}
              />
            </div>

            <div className="col">
              {" "}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.Gender}
                disabled={mode === "inactive"}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  name="Gender"
                  value={formValues.Gender}
                  onChange={handleChange}
                  disabled={mode === "inactive"}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
                {errors.Gender && (
                  <FormHelperText>{errors.Gender}</FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          {/* Row 4: Gender & Service Plan */}
          <div className="row">
            <div className="col">
              {" "}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.ServicePlan}
                disabled={mode === "inactive"}
              >
                <InputLabel>Service Plan</InputLabel>
                <Select
                  name="ServicePlan"
                  value={formValues.ServicePlan}
                  onChange={handleChange}
                  disabled={mode === "inactive"}
                >
                  <MenuItem value="Prepaid">Prepaid</MenuItem>
                  <MenuItem value="Postpaid">Postpaid</MenuItem>
                </Select>
                {errors.ServicePlan && (
                  <FormHelperText>{errors.ServicePlan}</FormHelperText>
                )}
              </FormControl>
            </div>

            <div className="col">
              <TextField
                name="Position"
                label="Position"
                value={formValues.Position}
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.Position}
                helperText={errors.Position}
                disabled={mode === "inactive"}
              />
            </div>
          </div>

          {/* Row 5: Position & Department  */}
          <div className="row">
            <div className="col">
              {" "}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.Department}
                disabled={mode === "inactive"}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  name="Department"
                  value={formValues.Department}
                  onChange={handleChange}
                  disabled={mode === "inactive"}
                >
                  <MenuItem value="Commercial">Commercial</MenuItem>
                  <MenuItem value="IT">Technology</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Risk">Risk, Compilance & Legal</MenuItem>
                  <MenuItem value="HR">Human Capital</MenuItem>
                </Select>
                {errors.Department && (
                  <FormHelperText>{errors.Department}</FormHelperText>
                )}
              </FormControl>
            </div>

            <div className="col">
              <TextField
                name="Division"
                label="Division"
                value={formValues.Division}
                onChange={handleChange}
                fullWidth
                margin="normal"
                // error={!!errors.Division}
                // helperText={errors.Division}
                disabled={mode === "inactive"}
              />
            </div>
          </div>

          {/* Row 6: Divison & Employment Category  */}
          <div className="row">
            <div className="col">
              {" "}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.EmploymentCategory}
                disabled={mode === "inactive"}
              >
                <InputLabel>Employment Category</InputLabel>
                <Select
                  name="EmploymentCategory"
                  value={formValues.EmploymentCategory}
                  onChange={handleChange}
                  disabled={mode === "inactive"}
                >
                  {employmentCategories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.value}
                    </MenuItem>
                  ))}
                </Select>
                {errors.EmploymentCategory && (
                  <FormHelperText>{errors.EmploymentCategory}</FormHelperText>
                )}
              </FormControl>
            </div>

            <div className="col">
              {" "}
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.AllocationID}
                disabled={mode === "inactive"}
              >
                <InputLabel>Staff Category</InputLabel>
                <Select
                  name="AllocationID"
                  disabled={
                    formValues.EmploymentCategory === "Temporary" ||
                    formValues.EmploymentCategory === "Retired" ||
                    mode === "inactive"
                  }
                  value={formValues.AllocationID}
                  onChange={handleChange}
                >
                  {getAllocationOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.AllocationID && (
                  <FormHelperText>{errors.AllocationID}</FormHelperText>
                )}
              </FormControl>
            </div>
          </div>

          {/* Row 7: User Role & Staff Category */}
          <div className="row">
            <div className="col">
              {" "}
              <FormControl fullWidth margin="normal" error={!!errors.RoleID}>
                <InputLabel>User Role</InputLabel>
                <Select
                  name="RoleID"
                  value={formValues.RoleID}
                  onChange={handleChange}
                  disabled={mode === "inactive"}
                >
                  <MenuItem value="1">Admin</MenuItem>
                  <MenuItem value="3">User</MenuItem>
{/* 
                  <MenuItem value="9">Fixed Asset Team</MenuItem>
                  <MenuItem value="5">Billing Team</MenuItem>
                  <MenuItem value="6">Key Accounts Supervisor</MenuItem>
                  <MenuItem value="7">ER Team</MenuItem>
                  <MenuItem value="10">Warehouse Team</MenuItem>
                  <MenuItem value="11">Retail Store Supervisor</MenuItem> */}
                  
                </Select>
                {errors.RoleID && (
                  <FormHelperText>{errors.RoleID}</FormHelperText>
                )}
              </FormControl>
            </div>

            <div className="col"></div>
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
              disabled={loading}
            >
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddEmployee;
