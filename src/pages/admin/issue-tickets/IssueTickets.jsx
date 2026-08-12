import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import { tokens } from "../../../theme";
import formatDate from "../../../components/global/dateFormatter";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/adminDashboard.css";

const NEXT_STATUS = {
  pending: "in progress",
  "in progress": "completed",
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
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);

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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAdvanceStatus = async (row) => {
    const currentStatus = String(row.status || "").trim().toLowerCase();
    const nextStatus = NEXT_STATUS[currentStatus];

    if (!nextStatus) {
      Swal.fire({
        icon: "info",
        title: "No further update",
        text: "Completed tickets cannot be advanced further.",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title:
        currentStatus === "pending"
          ? "Assign ticket to you?"
          : `Mark as "${nextStatus}"?`,
      html: `
        <p style="margin: 0 0 12px 0; color: #475569; text-align: left;">
          Ticket <strong>${row.ticketNumber}</strong> will move from
          <strong>${currentStatus}</strong> to <strong>${nextStatus}</strong>.
          ${
            currentStatus === "pending"
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
      confirmButtonText:
        currentStatus === "pending" ? "Assign & start" : "Update & notify",
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
    { field: "reason", headerName: "Reason", width: 160 },
    { field: "message", headerName: "Message", width: 260 },
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
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const status = String(params.row.status || "").trim().toLowerCase();
        const nextStatus = NEXT_STATUS[status];
        const isCompleted = status === "completed" || !nextStatus;
        const assignedCode = normalizeCode(params.row.assignedAdminCode);
        const isAssignedToOther =
          status === "in progress" &&
          assignedCode &&
          assignedCode !== currentAdminCode;
        const isDisabled =
          isCompleted || isAssignedToOther || updatingId === params.row.id;

        const buttonLabel = (() => {
          if (updatingId === params.row.id) return "Updating...";
          if (isCompleted) return "Completed";
          if (isAssignedToOther) return "Assigned elsewhere";
          if (status === "pending") return "Assign & start";
          return "Mark completed";
        })();

        const button = (
          <Button
            size="small"
            variant="contained"
            disabled={isDisabled}
            onClick={() => handleAdvanceStatus(params.row)}
            sx={{
              backgroundColor: isCompleted
                ? "#9CA3AF"
                : isAssignedToOther
                  ? "#9CA3AF"
                  : status === "pending"
                    ? "#F59E0B"
                    : "#16A34A",
              textTransform: "none",
              color: "#fff",
              "&:hover": {
                backgroundColor: isDisabled
                  ? undefined
                  : status === "pending"
                    ? "#D97706"
                    : "#15803D",
              },
            }}
          >
            {buttonLabel}
          </Button>
        );

        if (isAssignedToOther) {
          return (
            <Tooltip
              title={`Assigned to ${params.row.assignedAdminName}. Only they can complete this ticket.`}
            >
              <span>{button}</span>
            </Tooltip>
          );
        }

        return button;
      },
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
            </Select>
          </FormControl>
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
    </Box>
  );
};

export default IssueTickets;
