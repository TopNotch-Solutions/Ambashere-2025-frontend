import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { fireSwal } from "../../../utils/swalHelpers";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BuildIcon from "@mui/icons-material/Build";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import CancelScheduleSendOutlinedIcon from "@mui/icons-material/CancelScheduleSendOutlined";
import SendIcon from "@mui/icons-material/Send";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import formatDate from "../../../components/global/dateFormatter";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/support.css";

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  "in progress": { bg: "#DBEAFE", color: "#1E40AF", label: "In Progress" },
  completed: { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

const SUBSCRIPTION_CANCELLATION = "Subscription Cancellation";

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
  {
    icon: <CancelScheduleSendOutlinedIcon />,
    title: "Subscription Cancellation",
    value: SUBSCRIPTION_CANCELLATION,
    description:
      "Cancel an active subscription plan. Attach a scanned ID.",
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

const isZeroOrNullDevicePrice = (value) => {
  if (value === null || value === undefined || value === "") return true;
  const parsed = Number(value);
  return !Number.isNaN(parsed) && parsed === 0;
};

const isActiveContract = (contract) =>
  String(contract?.subscription_status || contract?.SubscriptionStatus || "")
    .trim()
    .toLowerCase() === "active";

const buildCancellationMessage = (contract) => {
  if (!contract) {
    return "I request cancellation of my active subscription.";
  }
  const msisdn = contract?.msisdn || contract?.MSISDN || "-";
  return `I request cancellation of my active subscription. MSISDN linked: ${msisdn}`;
};

const getContractLabel = (contract) => {
  const msisdn = contract?.msisdn || contract?.MSISDN || "Unknown MSISDN";
  const pkg = contract?.package || contract?.PackageName || "Package";
  return `${msisdn} · ${pkg}`;
};

const Support = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const isTemporary = currentUser?.EmploymentCategory === "Temporary";

  const [formData, setFormData] = useState({
    email: currentUser?.Email || "",
    subject: "",
    message: "",
    contractId: "",
  });
  const [attachment, setAttachment] = useState(null);
  const [cancellableContracts, setCancellableContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
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
    { value: SUBSCRIPTION_CANCELLATION, label: SUBSCRIPTION_CANCELLATION },
  ];

  const supportTopics = isTemporary ? tempSupportTopics : regularSupportTopics;
  const supportOptions = isTemporary ? tempSupportOptions : regularSupportOptions;
  const isCancellation = formData.subject === SUBSCRIPTION_CANCELLATION;

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

  const fetchCancellableContracts = useCallback(async () => {
    if (!currentUser?.EmployeeCode) return;
    try {
      setContractsLoading(true);
      const response = await axiosInstance.get(
        `/contracts/${currentUser.EmployeeCode}`
      );
      const contracts = Array.isArray(response.data?.contracts)
        ? response.data.contracts
        : [];
      const eligible = contracts.filter(
        (contract) =>
          isActiveContract(contract) &&
          !contract.isSubmission &&
          isZeroOrNullDevicePrice(
            contract.device_initial_cost ?? contract.DevicePrice
          )
      );
      setCancellableContracts(eligible);
    } catch (error) {
      console.error("Error fetching contracts for cancellation:", error);
      setCancellableContracts([]);
    } finally {
      setContractsLoading(false);
    }
  }, [currentUser?.EmployeeCode]);

  useEffect(() => {
    fetchTickets(ticketPage);
  }, [ticketPage, fetchTickets]);

  useEffect(() => {
    if (isCancellation) {
      fetchCancellableContracts();
    }
  }, [isCancellation, fetchCancellableContracts]);

  const selectedContract = useMemo(
    () =>
      cancellableContracts.find(
        (contract) => String(contract.id) === String(formData.contractId)
      ),
    [cancellableContracts, formData.contractId]
  );

  const canSubmitCancellation = Boolean(attachment);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "subject") {
      const nextIsCancellation = value === SUBSCRIPTION_CANCELLATION;
      setFormData((prev) => ({
        ...prev,
        subject: value,
        contractId: "",
        message: nextIsCancellation ? buildCancellationMessage(null) : prev.message,
      }));
      setAttachment(null);
      setErrors({});
      return;
    }

    if (name === "contractId") {
      const contract = cancellableContracts.find(
        (item) => String(item.id) === String(value)
      );
      setFormData((prev) => ({
        ...prev,
        contractId: value,
        message: buildCancellationMessage(contract || null),
      }));
      setErrors((prev) => ({
        ...prev,
        contractId: undefined,
        message: undefined,
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTopicSelect = (value) => {
    handleInputChange({ target: { name: "subject", value } });
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      String(file.type || "").toLowerCase() === "application/pdf" ||
      String(file.name || "").toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrors((prev) => ({
        ...prev,
        attachment: "Please upload a PDF of your scanned ID.",
      }));
      e.target.value = "";
      return;
    }

    setAttachment(file);
    setErrors((prev) => ({ ...prev, attachment: undefined }));
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.subject) validationErrors.subject = "Subject is required";

    if (isCancellation) {
      if (!attachment) {
        validationErrors.attachment =
          "Attach a scanned copy of your ID to continue";
      }

      if (!formData.message) {
        validationErrors.message = "Message is required";
      }
    } else if (!formData.message) {
      validationErrors.message = "Message is required";
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isCancellation && !canSubmitCancellation) {
      setErrors({
        attachment: !attachment
          ? "Attach a scanned copy of your ID to continue"
          : undefined,
      });
      return;
    }

    const confirmResult = await fireSwal({
      icon: "question",
      title: isCancellation
        ? "Submit subscription cancellation?"
        : "Submit support ticket?",
      text: isCancellation
        ? "Your cancellation request and scanned ID PDF will be sent to the support team."
        : "Please confirm that you want to submit this support request.",
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
    });
    if (!confirmResult.isConfirmed) return;

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("email", formData.email || currentUser?.Email || "");
      payload.append("subject", formData.subject);
      payload.append("message", formData.message);
      if (isCancellation) {
        if (formData.contractId) {
          payload.append("contractId", formData.contractId);
        }
        payload.append("subscription-image", attachment);
      }

      const response = await axiosInstance.post("/support-tickets", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await fireSwal({
          icon: "success",
          title: "Ticket Submitted",
          text: `Your support ticket ${response.data.ticket?.ticketNumber || ""} has been submitted. You will receive a confirmation email and notification.`,
        });
        setFormData({
          email: currentUser?.Email || "",
          subject: "",
          message: "",
          contractId: "",
        });
        setAttachment(null);
        setErrors({});
        setTicketPage(1);
        await fetchTickets(1);
      } else {
        await fireSwal({
          icon: "error",
          title: "Failed",
          text: "Failed to submit ticket. Please try again!",
        });
      }
    } catch (error) {
      await fireSwal({
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

  const handleCancelTicket = async (ticket) => {
    const confirmResult = await fireSwal({
      icon: "warning",
      title: "Cancel support ticket?",
      html: `Ticket <strong>${ticket.ticketNumber}</strong> will be cancelled. This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, cancel ticket",
      cancelButtonText: "Keep ticket",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setCancellingId(ticket.id);
      await axiosInstance.put(`/support-tickets/${ticket.id}/cancel`);
      await fireSwal({
        icon: "success",
        title: "Ticket Cancelled",
        text: "Your support ticket has been cancelled. Admins have been notified.",
        timer: 2200,
        showConfirmButton: false,
      });
      await fetchTickets(ticketPage);
    } catch (error) {
      await fireSwal({
        icon: "error",
        title: "Cancellation failed",
        text:
          error.response?.data?.message ||
          "Unable to cancel this ticket. Please try again.",
      });
    } finally {
      setCancellingId(null);
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
              <h5 className="mb-1">Staff Support Form</h5>
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

            {isCancellation && (
              <>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.contractId}
                  disabled={contractsLoading}
                >
                  <InputLabel>Select Active contract (optional)</InputLabel>
                  <Select
                    name="contractId"
                    value={formData.contractId}
                    onChange={handleInputChange}
                    label="Select Active contract (optional)"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {cancellableContracts.map((contract) => (
                      <MenuItem key={contract.id} value={String(contract.id)}>
                        {getContractLabel(contract)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.contractId ||
                      (contractsLoading
                        ? "Loading eligible contracts..."
                        : cancellableContracts.length
                          ? "Optional — select the active free-device contract if applicable."
                          : "No eligible free-device contracts found. You can still submit with your ID.")}
                  </FormHelperText>
                </FormControl>

                <div className="support-attachment-field">
                  <label
                    htmlFor="support-id-attachment"
                    className="support-attachment-label"
                  >
                    Scanned ID attachment (PDF)
                  </label>
                  <input
                    id="support-id-attachment"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleAttachmentChange}
                    className="support-attachment-input"
                  />
                  {errors.attachment && (
                    <p className="support-attachment-error">{errors.attachment}</p>
                  )}
                  {attachment && (
                    <div className="support-attachment-preview support-attachment-preview-pdf">
                      <span className="support-attachment-pdf-badge">
                        <PictureAsPdfOutlinedIcon fontSize="small" />
                        PDF
                      </span>
                      <span>{attachment.name}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={isCancellation ? undefined : handleInputChange}
              fullWidth
              margin="normal"
              multiline
              minRows={5}
              placeholder={
                isCancellation
                  ? "Cancellation message is prepared automatically."
                  : "Describe your issue or question in as much detail as possible..."
              }
              error={!!errors.message}
              helperText={
                errors.message ||
                (isCancellation
                  ? selectedContract
                    ? "This message is read-only and prepared from your selected contract."
                    : "This message is read-only. Optionally select a contract to include the MSISDN."
                  : "")
              }
              inputProps={{
                readOnly: isCancellation,
              }}
              sx={
                isCancellation
                  ? {
                      "& .MuiInputBase-root": {
                        backgroundColor: "#F3F4F6",
                        cursor: "default",
                      },
                    }
                  : undefined
              }
            />

            <button
              className="support-submit-btn"
              type="submit"
              disabled={
                isSubmitting || (isCancellation && !canSubmitCancellation)
              }
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
                        <th>Actions</th>
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
                          <td>
                            {String(ticket.status || "").toLowerCase() ===
                            "pending" ? (
                              <button
                                type="button"
                                className="support-cancel-btn"
                                onClick={() => handleCancelTicket(ticket)}
                                disabled={cancellingId === ticket.id}
                              >
                                {cancellingId === ticket.id ? (
                                  <CircularProgress
                                    size={14}
                                    sx={{ color: "#991B1B" }}
                                  />
                                ) : (
                                  <>
                                    <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                                    Cancel
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="support-ticket-no-action">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ticketPagination.totalPages > 1 && (
                  <div className="support-ticket-pagination">
                    <Typography
                      variant="body2"
                      className="support-ticket-pagination-label"
                    >
                      Showing page {ticketPage} of {ticketPagination.totalPages}{" "}
                      ({ticketPagination.total} tickets)
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
                    <span className="support-topic-copy">
                      {topic.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {isCancellation && (
              <div className="support-cancellation-tip-card mt-3">
                <div className="support-cancellation-tip-title">
                  <InfoOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Tip
                </div>
                <p className="support-cancellation-tip-copy mb-0">
                  Attach a clear PDF scan of your ID so the support team can
                  verify your subscription cancellation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
