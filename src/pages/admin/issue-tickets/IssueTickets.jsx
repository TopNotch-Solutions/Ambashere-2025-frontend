import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import { tokens } from "../../../theme";
import formatDate from "../../../components/global/dateFormatter";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/adminDashboard.css";
import "../../../assets/style/global/support.css";

const ALLOWED_NEXT_STATUSES = {
  pending: ["in progress", "completed"],
  "in progress": ["completed"],
};

const TICKETS_PER_PAGE = 40;

const normalizeCode = (code) =>
  String(code || "")
    .trim()
    .replace(/[-\s]/g, "")
    .toUpperCase();

const formatDurationMinutes = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return "—";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)} hrs`;
  return `${(minutes / 1440).toFixed(1)} days`;
};

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  "in progress": { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const StatCard = ({ title, value, subtitle }) => (
  <div className="card w-100 h-100">
    <div className="card-body d-flex flex-column justify-content-center">
      <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: "#0096D6", fontWeight: 700 }}>
        {value ?? "—"}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          {subtitle}
        </Typography>
      )}
    </div>
  </div>
);

const IssueTickets = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useSelector((state) => state.auth.user);
  const currentAdminCode = normalizeCode(currentUser?.EmployeeCode);

  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [viewTicket, setViewTicket] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const analyticsRes = await axiosInstance.get("/support-tickets/analytics");
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching ticket analytics:", error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const ticketsRes = await axiosInstance.get("/support-tickets", {
        params: {
          page: page + 1,
          limit: TICKETS_PER_PAGE,
          status: statusFilter,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        },
      });
      setTickets(ticketsRes.data.tickets || []);
      setRowCount(ticketsRes.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setTickets([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAdvanceStatus = async (row, targetStatus) => {
    const currentStatus = String(row.status || "").trim().toLowerCase();

    if (currentStatus === "cancelled" || currentStatus === "canceled") {
      Swal.fire({
        icon: "info",
        title: "Cancelled ticket",
        text: "This ticket was cancelled by the employee and cannot be updated.",
      });
      return;
    }

    const allowedStatuses = ALLOWED_NEXT_STATUSES[currentStatus] || [];
    const nextStatus = targetStatus || allowedStatuses[0];

    if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
      Swal.fire({
        icon: "info",
        title: "No further update",
        text: "Completed tickets cannot be advanced further.",
      });
      return;
    }

    const isDirectComplete =
      currentStatus === "pending" && nextStatus === "completed";

    const result = await Swal.fire({
      icon: "question",
      title: isDirectComplete
        ? "Mark ticket as completed?"
        : currentStatus === "pending"
          ? "Assign ticket to you?"
          : `Mark as "${nextStatus}"?`,
      html: `
        <p style="margin: 0 0 12px 0; color: #475569; text-align: left;">
          Ticket <strong>${row.ticketNumber}</strong> will move from
          <strong>${currentStatus}</strong> to <strong>${nextStatus}</strong>.
          ${
            isDirectComplete
              ? "The ticket will be resolved immediately and the employee will receive a system notification and email."
              : currentStatus === "pending"
                ? "You will be assigned as the handler and only you can complete this ticket."
                : "The employee will receive a system notification and email."
          }
        </p>
      `,
      input: "textarea",
      inputLabel: "Message to employee (optional)",
      inputPlaceholder:
        "Leave blank to send the default system notification message...",
      inputAttributes: {
        "aria-label": "Optional message to employee",
        rows: 4,
      },
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isDirectComplete
        ? "Mark completed"
        : currentStatus === "pending"
          ? "Assign & start"
          : "Update & notify",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const customMessage = String(result.value || "").trim();

    try {
      setUpdatingId(row.id);
      await axiosInstance.put(`/support-tickets/${row.id}/status`, {
        status: nextStatus,
        ...(customMessage ? { message: customMessage } : {}),
      });
      await fetchTickets();
      await fetchAnalytics();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: customMessage
          ? `Status changed to "${nextStatus}" with your custom message.`
          : `Status changed to "${nextStatus}" with the default notification.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error.response?.data?.message ||
          "Could not update ticket status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (!viewTicket) return;
    const updated = tickets.find((item) => item.id === viewTicket.id);
    if (!updated) return;

    setViewTicket({
      id: updated.id,
      ticketNumber: updated.ticketNumber,
      fullName: updated.fullName || "-",
      employeeCode: updated.employeeCode || "-",
      department: updated.department || "-",
      email: updated.email || "-",
      reason: updated.reason || "-",
      message: updated.message || "-",
      status: updated.status || "-",
      assignedAdminCode: updated.assignedAdminCode || null,
      assignedAdminName: updated.assignedAdminName || "-",
      inProgressAt: updated.inProgressAt ? formatDate(updated.inProgressAt) : "-",
      completedAt: updated.completedAt ? formatDate(updated.completedAt) : "-",
      createdAt: formatDate(updated.createdAt),
    });
  }, [tickets, viewTicket?.id]);

  const renderStatusActionButton = (row) => {
    if (!row) return null;

    const status = String(row.status || "").trim().toLowerCase();
    const allowedStatuses = ALLOWED_NEXT_STATUSES[status] || [];
    const isCancelled = status === "cancelled";
    const isCompleted =
      status === "completed" || isCancelled || allowedStatuses.length === 0;
    const assignedCode = normalizeCode(row.assignedAdminCode);
    const isAssignedToOther =
      status === "in progress" &&
      assignedCode &&
      assignedCode !== currentAdminCode;
    const isUpdating = updatingId === row.id;

    const renderActionButton = (label, nextStatus, color, hoverColor) => (
      <Button
        size="small"
        variant="contained"
        disabled={isUpdating || isAssignedToOther}
        onClick={() => handleAdvanceStatus(row, nextStatus)}
        className="support-ticket-view-btn"
        sx={{
          backgroundColor: color,
          textTransform: "none",
          color: "#fff",
          px: 1.5,
          minWidth: 0,
          "&:hover": {
            backgroundColor: isUpdating || isAssignedToOther ? undefined : hoverColor,
          },
        }}
      >
        {isUpdating ? (
          <CircularProgress size={16} sx={{ color: "#fff" }} />
        ) : (
          label
        )}
      </Button>
    );

    if (isCompleted) {
      return (
        <Button
          size="small"
          variant="contained"
          disabled
          className="support-ticket-view-btn"
          sx={{
            backgroundColor: isCancelled ? "#FCA5A5" : "#9CA3AF",
            textTransform: "none",
            color: "#fff",
            px: 1.5,
            minWidth: 0,
          }}
        >
          {isCancelled ? "Cancelled" : "Completed"}
        </Button>
      );
    }

    if (isAssignedToOther) {
      return (
        <Tooltip
          title={`Assigned to ${row.assignedAdminName}. Only they can complete this ticket.`}
        >
          <span>
            {renderActionButton("Assigned elsewhere", null, "#9CA3AF", "#9CA3AF")}
          </span>
        </Tooltip>
      );
    }

    if (status === "pending") {
      return (
        <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
          {renderActionButton("Assign & start", "in progress", "#F59E0B", "#D97706")}
          {renderActionButton("Mark completed", "completed", "#16A34A", "#15803D")}
        </Box>
      );
    }

    return renderActionButton("Mark completed", "completed", "#16A34A", "#15803D");
  };

  const rows = useMemo(
    () =>
      tickets.map((item) => ({
        id: item.id,
        ticketNumber: item.ticketNumber,
        fullName: item.fullName || "-",
        employeeCode: item.employeeCode || "-",
        department: item.department || "-",
        email: item.email || "-",
        reason: item.reason || "-",
        message: item.message || "-",
        status: item.status || "-",
        assignedAdminCode: item.assignedAdminCode || null,
        assignedAdminName: item.assignedAdminName || "-",
        inProgressAt: item.inProgressAt ? formatDate(item.inProgressAt) : "-",
        completedAt: item.completedAt ? formatDate(item.completedAt) : "-",
        createdAt: formatDate(item.createdAt),
      })),
    [tickets]
  );

  const columns = [
    { field: "ticketNumber", headerName: "Ticket #", width: 140 },
    { field: "fullName", headerName: "Employee", width: 160 },
    { field: "employeeCode", headerName: "Code", width: 110 },
    { field: "department", headerName: "Department", width: 140 },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = String(params.value || "").toLowerCase();
        const style = STATUS_COLORS[status] || { bg: "#F3F4F6", color: "#374151" };
        return (
          <span
            className="support-ticket-status-badge"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {params.value}
          </span>
        );
      },
    },
    { field: "createdAt", headerName: "Submitted", width: 130 },
    { field: "assignedAdminName", headerName: "Assigned To", width: 140 },
    { field: "inProgressAt", headerName: "Started", width: 130 },
    { field: "completedAt", headerName: "Completed", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 340,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View ticket details">
            <Button
              size="small"
              variant="contained"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setViewTicket(params.row)}
              className="support-ticket-view-btn"
              sx={{
                minWidth: 0,
                px: 1.5,
                backgroundColor: "rgba(0, 150, 214, 0.12)",
                color: "#0096D6",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "rgba(0, 150, 214, 0.2)",
                  boxShadow: "none",
                },
              }}
            >
              View
            </Button>
          </Tooltip>
          {renderStatusActionButton(params.row)}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px" className="handset-simulator-page admin-dashboard-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Issue Tickets</h2>
          <p className="handset-subtitle mb-0">
            Review employee support requests, assign tickets to yourself when
            starting work, and track pickup and resolution times in analytics.
          </p>
        </div>
      </div>

      <Box
        className="admin-dashboard-grid"
        display="grid"
        gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
        gridAutoRows="120px"
        gap="20px"
        mb="20px"
      >
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard title="Total Tickets" value={analytics?.total} subtitle="All time" />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard title="Pending" value={analytics?.pending} subtitle="Awaiting action" />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard title="In Progress" value={analytics?.inProgress} subtitle="Being handled" />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard title="Completed" value={analytics?.completed} subtitle="Resolved" />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard title="Cancelled" value={analytics?.cancelled} subtitle="Withdrawn by employee" />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard
            title="Avg Pickup Time"
            value={formatDurationMinutes(analytics?.avgPickupMinutes)}
            subtitle="Pending → in progress"
          />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard
            title="Avg Resolution Time"
            value={formatDurationMinutes(analytics?.avgResolutionMinutes)}
            subtitle="In progress → completed"
          />
        </Box>
        <Box gridColumn={isSmallScreen ? "span 12" : "span 3"}>
          <StatCard
            title="Avg Total Time"
            value={formatDurationMinutes(analytics?.avgTotalMinutes)}
            subtitle="Submitted → completed"
          />
        </Box>
      </Box>

      {analytics?.byAssignee?.length > 0 && (
        <Box
          className="shadow admin-dashboard-card handset-form-card mb-4"
          sx={{ p: 2 }}
        >
          <h6 className="summary-title mb-3">Performance by Assignee</h6>
          <div className="row g-2">
            {analytics.byAssignee.map((item) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={item.assignedAdminCode}
              >
                <div className="support-reason-stat">
                  <span className="support-reason-stat-label">
                    {item.assignedAdminName}
                  </span>
                  <span className="support-reason-stat-count">
                    {item.ticketCount} assigned · {item.completedCount} completed
                  </span>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Avg resolution:{" "}
                    {formatDurationMinutes(item.avgResolutionMinutes)}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {analytics?.byReason?.length > 0 && (
        <Box
          className="shadow admin-dashboard-card handset-form-card mb-4"
          sx={{ p: 2 }}
        >
          <h6 className="summary-title mb-3">Tickets by Reason</h6>
          <div className="row g-2">
            {analytics.byReason.map((item) => (
              <div className="col-6 col-md-4 col-lg-3" key={item.reason}>
                <div className="support-reason-stat">
                  <span className="support-reason-stat-label">{item.reason}</span>
                  <span className="support-reason-stat-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      <Box
        className="shadow admin-dashboard-card handset-form-card"
        sx={{ p: 2, minHeight: 420 }}
      >
        <Box className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
          <h6 className="summary-title mb-0">Support Tickets</h6>
          <Box className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
            <Box
              display="flex"
              borderRadius="8px"
              width={{ xs: "100%", sm: 260 }}
              sx={{ backgroundColor: colors.primary[400] }}
            >
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search tickets"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <IconButton type="button" sx={{ p: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="ticket-status-filter-label">Filter by status</InputLabel>
              <Select
                labelId="ticket-status-filter-label"
                value={statusFilter}
                label="Filter by status"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in progress">In progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" minHeight="240px">
            <CircularProgress sx={{ color: "#0096D6" }} />
          </Box>
        ) : (
          <Box
            height="420px"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#1674BB",
                color: "white",
                borderBottom: "none",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": { borderTop: "none" },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pagination
              paginationMode="server"
              rowCount={rowCount}
              page={page}
              pageSize={TICKETS_PER_PAGE}
              rowsPerPageOptions={[TICKETS_PER_PAGE]}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </Box>
        )}
      </Box>

      <Dialog
        className="support-ticket-view-dialog"
        open={Boolean(viewTicket)}
        onClose={() => setViewTicket(null)}
        maxWidth="sm"
        fullWidth
      >
        <Box className="support-ticket-view-header">
          <Box>
            <span className="support-ticket-view-header-label">Support ticket</span>
            <h3 className="support-ticket-view-header-title">
              {viewTicket?.ticketNumber}
            </h3>
          </Box>
          <IconButton
            aria-label="Close ticket details"
            onClick={() => setViewTicket(null)}
            className="support-ticket-view-close"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent className="support-ticket-view-body" sx={{ p: 0 }}>
          {viewTicket && (
            <>
              <Box className="support-ticket-view-profile">
                <span className="support-ticket-view-avatar">
                  {getInitials(viewTicket.fullName)}
                </span>
                <Box>
                  <p className="support-ticket-view-profile-name">
                    {viewTicket.fullName}
                  </p>
                  <p className="support-ticket-view-profile-meta">
                    {viewTicket.employeeCode} · {viewTicket.department}
                  </p>
                  <p className="support-ticket-view-profile-meta">{viewTicket.email}</p>
                </Box>
              </Box>

              <Box className="support-ticket-view-meta-grid">
                <Box className="support-ticket-view-meta-card">
                  <span className="support-ticket-view-meta-label">Status</span>
                  <Box>
                    {(() => {
                      const status = String(viewTicket.status || "").toLowerCase();
                      const style =
                        STATUS_COLORS[status] || { bg: "#F3F4F6", color: "#374151" };
                      return (
                        <span
                          className="support-ticket-status-badge"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {viewTicket.status}
                        </span>
                      );
                    })()}
                  </Box>
                </Box>
                <Box className="support-ticket-view-meta-card">
                  <span className="support-ticket-view-meta-label">Assigned to</span>
                  <span className="support-ticket-view-meta-value">
                    {viewTicket.assignedAdminName !== "-"
                      ? viewTicket.assignedAdminName
                      : "Unassigned"}
                  </span>
                </Box>
              </Box>

              <Box className="support-ticket-view-section">
                <h4 className="support-ticket-view-section-title">
                  <SubjectOutlinedIcon />
                  Reason
                </h4>
                <p className="support-ticket-view-reason">{viewTicket.reason}</p>
              </Box>

              <Box className="support-ticket-view-section">
                <h4 className="support-ticket-view-section-title">
                  <ChatBubbleOutlineIcon />
                  Message
                </h4>
                <p className="support-ticket-view-message">{viewTicket.message}</p>
              </Box>

              <Box className="support-ticket-view-section">
                <h4 className="support-ticket-view-section-title">
                  <ScheduleOutlinedIcon />
                  Timeline
                </h4>
                <div className="support-ticket-view-timeline">
                  <div className="support-ticket-view-timeline-item">
                    <span className="support-ticket-view-timeline-dot" />
                    <div>
                      <p className="support-ticket-view-timeline-label">Submitted</p>
                      <p className="support-ticket-view-timeline-date">
                        {viewTicket.createdAt}
                      </p>
                    </div>
                  </div>
                  {viewTicket.inProgressAt !== "-" && (
                    <div className="support-ticket-view-timeline-item">
                      <span className="support-ticket-view-timeline-dot" />
                      <div>
                        <p className="support-ticket-view-timeline-label">Started</p>
                        <p className="support-ticket-view-timeline-date">
                          {viewTicket.inProgressAt}
                        </p>
                      </div>
                    </div>
                  )}
                  {viewTicket.completedAt !== "-" && (
                    <div className="support-ticket-view-timeline-item">
                      <span className="support-ticket-view-timeline-dot" />
                      <div>
                        <p className="support-ticket-view-timeline-label">Completed</p>
                        <p className="support-ticket-view-timeline-date">
                          {viewTicket.completedAt}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions className="support-ticket-view-footer" sx={{ p: 0 }}>
          <Button
            onClick={() => setViewTicket(null)}
            className="support-ticket-view-btn"
            sx={{ color: "#64748b" }}
          >
            Close
          </Button>
          <Box>{renderStatusActionButton(viewTicket)}</Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueTickets;
