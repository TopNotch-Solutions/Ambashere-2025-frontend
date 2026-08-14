import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BuildIcon from "@mui/icons-material/Build";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SendIcon from "@mui/icons-material/Send";
import formatDate from "../../../components/global/dateFormatter";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/support.css";

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  "in progress": { bg: "#DBEAFE", color: "#1E40AF", label: "In Progress" },
  completed: { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
};

const tempSupportTopics = [
  {
    icon: <AssignmentIcon />,
    title: "Airtime Issues",
    value: "Airtime Issues",
    description: "Questions about airtime packages, balances, or allocations.",
  },
  {
    icon: <AccountCircleIcon />,
    title: "Profile Updates",
    value: "Profile Updates",
    description: "Request changes to your account or employment details.",
  },
  {
    icon: <DevicesOtherIcon />,
    title: "Employment Inquiry",
    value: "Employment Inquiry",
    description: "Ask about your temporary employment status or terms.",
  },
  {
    icon: <BuildIcon />,
    title: "Technical Support",
    value: "Technical Support",
    description: "Report login problems, errors, or platform issues.",
  },
];

const regularSupportTopics = [
  {
    icon: <ChatBubbleOutlineIcon />,
    title: "General Inquiry",
    value: "Inquiry",
    description: "Ask a question about your benefits or how Ambasphere works.",
  },
  {
    icon: <ReportProblemOutlinedIcon />,
    title: "Complaint",
    value: "Complaint",
    description: "Raise a concern about a benefit, contract, or service.",
  },
  {
    icon: <LightbulbOutlinedIcon />,
    title: "Suggestion",
    value: "Suggestion",
    description: "Share feedback or ideas to improve the platform.",
  },
];

const StatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  const style = STATUS_COLORS[key] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span
      className="support-ticket-status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label || status}
    </span>
  );
};

const TICKETS_PER_PAGE = 20;

const Support = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const isTemporary = currentUser?.EmploymentCategory === "Temporary";

  const [formData, setFormData] = useState({
    email: currentUser?.Email || "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketPagination, setTicketPagination] = useState({
    total: 0,
    totalPages: 1,
  });

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

  const supportTopics = isTemporary ? tempSupportTopics : regularSupportTopics;
  const supportOptions = isTemporary ? tempSupportOptions : regularSupportOptions;

  const fetchTickets = useCallback(async (pageNum = 1) => {
    try {
      setTicketsLoading(true);
      const response = await axiosInstance.get("/support-tickets/mine", {
        params: { page: pageNum, limit: TICKETS_PER_PAGE },
      });
      setTickets(response.data.tickets || []);
      setTicketPagination(
        response.data.pagination || { total: 0, totalPages: 1 }
      );
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setTickets([]);
      setTicketPagination({ total: 0, totalPages: 1 });
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(ticketPage);
  }, [ticketPage, fetchTickets]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTopicSelect = (value) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    setErrors((prev) => ({ ...prev, subject: undefined }));
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

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "Submit support ticket?",
      text: "Please confirm that you want to submit this support request.",
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
    });
    if (!confirmResult.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post("/support-tickets", formData);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Ticket Submitted",
          text: `Your support ticket ${response.data.ticket?.ticketNumber || ""} has been submitted. You will receive a confirmation email and notification.`,
        });
        setFormData({
          email: currentUser?.Email || "",
          subject: "",
          message: "",
        });
        setTicketPage(1);
        await fetchTickets(1);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to submit ticket. Please try again!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Error submitting ticket. Please try again!",
      });
      setResponseMessage("Error submitting ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-main m-3 handset-simulator-page support-page">
      <div className="support-hero mb-4">
        <div>
          <h2 className="handset-title">Support Center</h2>
          <p className="handset-subtitle mb-0">
            Submit a request and the Ambasphere team will assist you with
            benefits, account issues, and platform support.
          </p>
          {isTemporary && (
            <p className="support-temp-note mb-0 mt-2">
              As temporary staff, you can request help with airtime, profile
              updates, and employment-related inquiries.
            </p>
          )}
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-8">
          <form className="handset-form-card shadow-sm support-form-card" onSubmit={handleSubmit}>
            <div className="form-header mb-1">
              <h5 className="mb-1">
                {isTemporary ? "Staff Support Form" : "Support Form"}
              </h5>
              <p className="mb-0">
                Complete the form below and your request will be routed to the
                Ambasphere support team.
              </p>
            </div>
            <div className="support-routing-note">
              Your message will be sent to the Ambasphere administrative and
              support teams on your behalf. A ticket will be created and you
              will receive email and system notifications.
            </div>

            {responseMessage && (
              <Alert severity="info" className="mb-3 mt-3">
                {responseMessage}
              </Alert>
            )}

            <FormControl fullWidth margin="normal" error={!!errors.subject}>
              <InputLabel>Reason for Support</InputLabel>
              <Select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                label="Reason for Support"
              >
                {supportOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.subject && (
                <FormHelperText>{errors.subject}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              minRows={5}
              placeholder="Describe your issue or question in as much detail as possible..."
              error={!!errors.message}
              helperText={errors.message || ""}
            />

            <button
              className="support-submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
              ) : (
                <>
                  <SendIcon fontSize="small" />
                  Submit Ticket
                </>
              )}
            </button>
          </form>

          <div className="handset-form-card shadow-sm support-ticket-log mt-4">
            <div className="form-header mb-3">
              <h5 className="mb-1">My Ticket Log</h5>
              <p className="mb-0">
                Track the status of support requests you have submitted.
              </p>
            </div>

            {ticketsLoading ? (
              <div className="support-ticket-log-loading">
                <CircularProgress size={28} sx={{ color: "#0096D6" }} />
              </div>
            ) : tickets.length === 0 ? (
              <p className="support-ticket-log-empty mb-0">
                You have not submitted any support tickets yet.
              </p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table support-ticket-table mb-0">
                    <thead>
                      <tr>
                        <th>Ticket #</th>
                        <th>Reason</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="fw-semibold">{ticket.ticketNumber}</td>
                          <td>{ticket.reason}</td>
                          <td className="support-ticket-message-cell">
                            {ticket.message}
                          </td>
                          <td>
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td>{formatDate(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ticketPagination.totalPages > 1 && (
                  <div className="support-ticket-pagination">
                    <Typography variant="body2" className="support-ticket-pagination-label">
                      Showing page {ticketPage} of {ticketPagination.totalPages} (
                      {ticketPagination.total} tickets)
                    </Typography>
                    <Pagination
                      count={ticketPagination.totalPages}
                      page={ticketPage}
                      onChange={(_, value) => setTicketPage(value)}
                      color="primary"
                      shape="rounded"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="support-topics-sidebar handset-form-card shadow-sm">
            <h6 className="support-topics-heading">Choose a topic</h6>
            <p className="support-topics-copy mb-0">
              Select a category to pre-fill your support reason.
            </p>
            <div className="support-topics-list">
              {supportTopics.map((topic) => (
                <button
                  key={topic.value}
                  type="button"
                  className={`support-topic-card${
                    formData.subject === topic.value ? " is-selected" : ""
                  }`}
                  onClick={() => handleTopicSelect(topic.value)}
                >
                  <span className="support-topic-icon" aria-hidden="true">
                    {topic.icon}
                  </span>
                  <span className="support-topic-content">
                    <span className="support-topic-title">{topic.title}</span>
                    <span className="support-topic-copy">{topic.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
