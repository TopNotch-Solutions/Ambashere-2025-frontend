import React, { useState } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import pic from "../../../assets/Img/wellness.png";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import InfoIcon from "@mui/icons-material/Info";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/support.css";

const Support = () => {
  const currentUser = useSelector((state) => state.auth.user);

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
    <div className="container-main m-3 handset-simulator-page support-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Support Center</h2>
          <p className="handset-subtitle mb-0">
            Reach out to the Ambasphere team for assistance with accounts,
            benefits, and technical issues.
          </p>
          {currentUser?.EmploymentCategory === "Temporary" && (
            <p className="support-temp-note mb-0 mt-2">
              As temporary staff, you have access to specialized support options
              for airtime, profile updates, and employment inquiries.
            </p>
          )}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <form className="handset-form-card shadow-sm" onSubmit={handleSubmit}>
            <div className="form-header">
              <h5 className="mb-1">
                {currentUser?.EmploymentCategory === "Temporary"
                  ? "Staff Support Form"
                  : "Support Form"}
              </h5>
              <p className="mb-0">
                Share your request and our support team will get back to you as
                soon as possible.
              </p>
            </div>

            {responseMessage && (
              <Alert severity="info" className="mb-3">
                {responseMessage}
              </Alert>
            )}

            <div className="row">
              <div className="col-md-6">
                <TextField
                  label="To"
                  value="Ambasphere administrative team"
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </div>
              <div className="col-md-6">
                <TextField
                  label="CC"
                  value="Ambasphere support team"
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <FormControl fullWidth margin="normal" error={!!errors.subject}>
                  <InputLabel>Reason for Support</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    label="Reason for Support"
                  >
                    {(
                      currentUser?.EmploymentCategory === "Temporary"
                        ? tempSupportOptions
                        : regularSupportOptions
                    ).map((option) => (
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
            </div>

            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              minRows={4}
              error={!!errors.message}
              helperText={errors.message || ""}
            />

            <button
              className="support-submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <CircularProgress size={16} sx={{ color: "white" }} />
              )}
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </form>
        </div>

        <div className="col-12 col-xl-4">
          <div className="handset-summary-card shadow-sm support-summary-card">
            <h6 className="summary-title">Support Contacts</h6>
            <div className="summary-row">
              <span>
                <EmailIcon fontSize="small" className="support-icon" /> HR
                Department
              </span>
              <strong>hr@mtc.com.na</strong>
            </div>
            <div className="summary-row">
              <span>
                <PhoneIcon fontSize="small" className="support-icon" /> IT
                Support
              </span>
              <strong>itsupport@mtc.com.na</strong>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row">
              <span>
                <InfoIcon fontSize="small" className="support-icon" /> Response
                Time
              </span>
              <strong>Within 24 hours</strong>
            </div>
            <div className="support-image-wrap mt-3">
              <img src={pic} alt="Support" className="img-fluid support-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
