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

const AddEmployee = ({ open, handleClose, mode = "", employeeData = {} }) => {
  const [errors, setErrors] = useState({});
  var phoneNumberRegex = /^(81\d{7}|081\d{7}|26481\d{7}|\+26481\d{7})$/;
  var employeeCodeRegex = /^E-?[A-Z]{4}\d{2}$/;

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

  const [formValues, setFormValues] = useState({
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
  });

  useEffect(() => {
    if (mode === "edit" && employeeData) {
      setFormValues(employeeData);
    } else if (mode === "inactive" && employeeData) {
      setFormValues({
        ...employeeData,
        EmploymentStatus: "Inactive",
      });
    }
  }, [mode, employeeData]);

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

      // Autofill email based on first and last name
      if (name === "FirstName" || name === "LastName") {
        const firstName = name === "FirstName" ? value : prevValues.FirstName;
        const lastName = name === "LastName" ? value : prevValues.LastName;

        if (firstName && lastName) {
          const email = `${firstName[0].toLowerCase()}${lastName
            .trim()
            .toLowerCase()}@mtc.com.na`;
          newValues.Email = email;
        }
      }

      // UserName
      if (name === "FirstName" || name === "LastName") {
        const firstName = name === "FirstName" ? value : prevValues.FirstName;
        const lastName = name === "LastName" ? value : prevValues.LastName;

        if (firstName && lastName) {
          const username = `${lastName
            .trim()
            .toLowerCase()}${firstName.trim().toLowerCase()}`;
          newValues.UserName = username;
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

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formValues };
    delete payload.ProfileImage;

    let validationErrors = {};

    // Check required fields
    for (const [key, value] of Object.entries(formValues)) {
      if (!value && key !== "EmploymentStatus" && key !== "ProfileImage") {
        validationErrors[key] = "This field is required";
      }
    }
    const lastName = formValues.LastName;
    const formattedPhoneNumber = validatePhoneNumber(formValues.PhoneNumber);
    const employeeCode = formValues.EmployeeCode;

    // Validate specific fields
    // Validate phone number
    if (!phoneNumberRegex.test(formattedPhoneNumber)) {
      validationErrors.PhoneNumber = "Please enter a valid phone number.";
    } else {
      formValues.PhoneNumber = formattedPhoneNumber; // Ensure phone number is correctly formatted before saving
    }

    // Validate employeeCode
    if (!employeeCodeRegex.test(employeeCode)) {
      validationErrors.EmployeeCode = "Please enter a valid employee code.";
    } else {
      const codeLetters = employeeCode.startsWith("E-")
        ? employeeCode.slice(2, 6)
        : employeeCode.slice(1, 5);
      if (codeLetters !== lastName.slice(0, 4).toUpperCase()) {
        validationErrors.EmployeeCode =
          "Employee code does not match the first four letters of the last name.";
      }
    }

    // console.log(validationErrors); // Log validation errors

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      let response;
      if (mode === "add") {
        response = await axiosInstance.post(
          "/staffmember/createStaff",
          formValues
        );
      } else if (mode === "edit") {
        response = await axiosInstance.put(
          `/staffmember/updateStaff/${formValues.EmployeeCode}`,
          formValues
        );
      } else if (mode === "inactive") {
        response = await axiosInstance.put(
          `/staffmember/removeStaff/${formValues.EmployeeCode}`,
          { EmploymentStatus: "Inactive" }
        );
      }

      // console.log(response); // Log the API response
      if (response.status >= 200 && response.status < 300) {
        handleClose();
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
        handleClose();
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
      // console.log(error); // Log any caught errors
      handleClose();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error ${
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
                disabled={mode === "edit" || mode === "inactive"}
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
                disabled={mode === "edit" || mode === "inactive"}
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
                  (formValues.FullName =
                    formValues.FirstName + " " + formValues.LastName)
                }
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.FullName}
                helperText={errors.FullName}
                disabled={true}
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
                  (formValues.UserName =
                    formValues.LastName + formValues.FirstName.charAt(0))
                }
                onChange={handleChange}
                fullWidth
                margin="normal"
                error={!!errors.FullName}
                helperText={errors.FullName}
                disabled={true}
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
                disabled={true}
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
                  disabled={mode === "edit" || mode === "inactive"}
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
                  disabled={mode === "edit" || mode === "inactive"}
                >
                  <MenuItem value="1">Admin</MenuItem>
                  <MenuItem value="3">User</MenuItem>

                  <MenuItem value="9">Fixed Asset Team</MenuItem>
                  <MenuItem value="5">Billing Team</MenuItem>
                  <MenuItem value="6">Key Accounts Supervisor</MenuItem>
                  <MenuItem value="7">ER Team</MenuItem>
                  <MenuItem value="10">Warehouse Team</MenuItem>
                  <MenuItem value="11">Retail Store Supervisor</MenuItem>
                  
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
              // disabled={mode === "inactive"}
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
