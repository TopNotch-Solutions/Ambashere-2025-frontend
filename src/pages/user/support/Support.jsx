import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import pic from "../../../assets/Img/wellness.png";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import { tokens } from "../../../theme";
import { useTheme } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import InfoIcon from "@mui/icons-material/Info";

const Support = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Debug logging
  console.log("Current user:", currentUser);
  console.log("Employment Category:", currentUser?.EmploymentCategory);
  console.log("Is Temporary:", currentUser?.EmploymentCategory === "Temporary");

  const [formData, setFormData] = useState({
    email: currentUser?.Email || "", // Ensure currentUser exists
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporary user specific support options
  const tempSupportOptions = [
    { value: "Airtime Issues", label: "Airtime Issues" },
    { value: "Profile Updates", label: "Profile Updates" },
    { value: "Employment Inquiry", label: "Employment Inquiry" },
    { value: "Technical Support", label: "Technical Support" },
    { value: "HR Questions", label: "HR Questions" },
    { value: "General Inquiry", label: "General Inquiry" },
  ];

  const regularSupportOptions = [
    { value: "Inquiry", label: "Inquiry" },
    { value: "Complaint", label: "Complaint" },
    { value: "Suggestion", label: "Suggestion" },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.subject) validationErrors.subject = "Subject is required";
    if (!formData.message) validationErrors.message = "Message is required";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post("/email", formData);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Email sent successfully!`,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        // setResponseMessage("Email sent successfully!");
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: `Failed to send email. Please try again!`,
        });
        // setResponseMessage("Failed to send email. Please try again.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error sending email. Please try again!`,
      });
      setResponseMessage("Error sending email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-main m-3">
      <div className="row">
        {/* Temporary User Information Panel */}
        {currentUser?.EmploymentCategory === "Temporary" && (
          <div className="col-12">
             <Typography variant="body2">
                As a staff member, you have access to specialized support options. 
                Use the form below to get help with airtime issues, profile updates, or employment inquiries.
              </Typography>
          </div>
        )}

        <div className="col-12">
          <Box
            className="mt-lg-5 mt-2"
            sx={{
              width: "100%",
              minHeight: "400px",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
              padding: 2,
            }}
          >
          <div className="row">
            <form className="col-xl-8 p-4" onSubmit={handleSubmit} style={{ minHeight: "300px" }}>
              <h2 className="text-center" style={{ color: "#1A69AC", marginBottom: "20px" }}>
                {currentUser?.EmploymentCategory === "Temporary" ? "Staff Support" : "Support Form"}
              </h2>
              <p className="text-center" style={{ color: "#666666", marginBottom: "30px" }}>
                {currentUser?.EmploymentCategory === "Temporary" 
                  ? "Get help with your staff account and benefits."
                  : "Write any queries or questions you might have and we will get back to you."
                }
              </p>

              <div className="row">
                <div className="row">
                  <div className="col">
                    <TextField
                      name=""
                      label="To"
                      value="Ambasphere administrative team"
                      fullWidth
                      margin="normal"
                      disabled="true"
                    />
                  </div>

                  <div className="col">
                    <TextField
                      name=""
                      label="CC"
                      value="Ambasphere support team"
                      fullWidth
                      margin="normal"
                      disabled="true"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={!!errors.subject}
                  >
                    <InputLabel>Reason for Support</InputLabel>
                    <Select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    >
                      {(currentUser?.EmploymentCategory === "Temporary" ? tempSupportOptions : regularSupportOptions).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.subject && (
                      <FormHelperText>{errors.subject}</FormHelperText>
                    )}
                  </FormControl>
                </div>

                <div className="col"></div>
              </div>

              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Leave a comment here"
                  id="floatingTextarea2"
                  style={{ height: "100px" }}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                />
                <label htmlFor="floatingTextarea2">Message</label>
                {errors.message && (
                  <p className="text-danger">{errors.message}</p>
                )}
              </div>

              <button
                className="btn btn-primary mt-3"
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  backgroundColor: isSubmitting ? "#ccc" : "#0096D6",
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: "5px",
                  borderColor: "#1A69AC",
                  border: "1px solid",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isSubmitting && <CircularProgress size={16} sx={{ color: "white" }} />}
                {isSubmitting ? "Sending..." : "Send Email"}
              </button>

              {responseMessage && (
                <p className="text-center mt-3">{responseMessage}</p>
              )}
            </form>

            <div className="col-md-4 d-none d-xl-block">
              {currentUser?.EmploymentCategory === "Temporary" ? (
                <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                  <CardContent>
                    <Typography variant="h6" style={{ color: "black" }} className="mb-3">
                      <ContactSupportIcon sx={{ mr: 1, color: "#0096D6" }} />
                      Quick Contact
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Card sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                          <CardContent>
                            <Typography variant="subtitle2" style={{ color: "black" }}>
                              <EmailIcon sx={{ mr: 1, fontSize: 20, color: "#0096D6" }} />
                              HR Department
                            </Typography>
                            <Typography variant="body2" style={{ color: "black" }}>
                              hr@mtc.com.na
                            </Typography>
                            <Chip 
                              label="Employment Issues" 
                              size="small" 
                              sx={{ 
                                backgroundColor: "#1A69AC",
                                color: "white",
                                mt: 1
                              }} 
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
                          <CardContent>
                            <Typography variant="subtitle2" style={{ color: "black" }}>
                              <PhoneIcon sx={{ mr: 1, fontSize: 20, color: "#1674BB" }} />
                              IT Support
                            </Typography>
                            <Typography variant="body2" style={{ color: "black" }}>
                              itsupport@mtc.com.na
                            </Typography>
                            <Chip 
                              label="Technical Issues" 
                              size="small" 
                              sx={{ 
                                backgroundColor: "#1A69AC",
                                color: "white",
                                mt: 1
                              }} 
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <img src={pic} alt="Support" className="img-fluid w-100 h-100" />
              )}
            </div>
          </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Support;
