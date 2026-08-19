import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { confirmAdminAction } from "../../../utils/adminConfirm";
import { useSelector } from "react-redux";
import InfoBox from "../../../components/admin/charts/InfoBox";
import AirtimeSubmissionsYoYChart from "../../../components/admin/charts/AirtimeSubmissionsYoYChart";
import SubmissionViewDialog from "../../../components/admin/SubmissionViewDialog";
import axiosInstance from "../../../utils/axiosInstance";
import { tokens } from "../../../theme";
import { formatMoney } from "../../../utils/formatMoney";
import formatDate from "../../../components/global/dateFormatter";
import { renderStatusCell, StatusBadge } from "../../../utils/statusBadge";
import {
  renderContractStatusActionButton,
  renderContractViewButton,
  renderContractCancelButton,
} from "../../../utils/contractSubmissionActions";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/adminDashboard.css";
import "../../../assets/style/global/support.css";

const NEXT_STATUS = {
  pending: "in progress",
  "in progress": "completed",
};

const normalizeCode = (code) =>
  String(code || "")
    .trim()
    .replace(/[-\s]/g, "")
    .toUpperCase();

const mapHandsetSubmissionRow = (item, index) => ({
  id: item.id ?? `submission-${index}`,
  employeeCode: item.employeeCode || "-",
  fullName: item.FullName || item.employee_name || "-",
  device: item.device || "-",
  device_price: formatMoney(item.device_price),
  excess_payment: formatMoney(item.excess_payment),
  contract_submitted_date: formatDate(item.contract_submitted_date),
  subscription_status: item.subscription_status || "-",
  assignedAdminCode: item.assignedAdminCode || null,
  assignedAdminName: item.assignedAdminName || "-",
  isReceived: Boolean(item.isReceived),
});

const AdminHandsetContracts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currentUser = useSelector((state) => state.auth.user);
  const currentAdminCode = normalizeCode(currentUser?.EmployeeCode);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [viewSubmission, setViewSubmission] = useState(null);

  const fetchActiveSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/handsets/submissions/active");
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching active handset submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSubmissions();
  }, [fetchActiveSubmissions]);

  useEffect(() => {
    if (!viewSubmission) return;
    const index = submissions.findIndex((item) => item.id === viewSubmission.id);
    if (index === -1) return;
    setViewSubmission(mapHandsetSubmissionRow(submissions[index], index));
  }, [submissions, viewSubmission?.id]);

  const handleAdvanceStatus = async (row) => {
    const currentStatus = String(row.subscription_status || "")
      .trim()
      .toLowerCase();

    if (currentStatus === "cancelled" || currentStatus === "canceled") {
      Swal.fire({
        icon: "info",
        title: "Cancelled submission",
        text: "This submission was cancelled by the employee and cannot be updated.",
      });
      return;
    }

    const nextStatus = NEXT_STATUS[currentStatus];

    if (!nextStatus) {
      Swal.fire({
        icon: "info",
        title: "No further update",
        text: "Completed submissions cannot be advanced further.",
      });
      return;
    }

    const confirmed = await confirmAdminAction({
      title:
        currentStatus === "pending"
          ? "Assign this contract to you?"
          : "Mark as completed?",
      text:
        currentStatus === "pending"
          ? "This will move the contract to in progress and assign it to you. Only you will be able to mark it as completed."
          : `Change status from "${currentStatus}" to "${nextStatus}"?`,
      confirmButtonText:
        currentStatus === "pending" ? "Assign & start" : "Mark completed",
    });

    if (!confirmed) return;

    try {
      setUpdatingId(row.id);
      await axiosInstance.put(`/handsets/submissions/${row.id}/status`, {
        subscription_status: nextStatus,
      });
      await fetchActiveSubmissions();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: `Status changed to "${nextStatus}".`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error.response?.data?.message ||
          "Could not update submission status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const statusActionProps = {
    currentAdminCode,
    updatingId,
    onAdvance: handleAdvanceStatus,
    normalizeCode,
  };

  const handleAdminCancel = async (row) => {
    const currentStatus = String(row.subscription_status || "")
      .trim()
      .toLowerCase();

    if (currentStatus !== "in progress" && currentStatus !== "completed") {
      Swal.fire({
        icon: "info",
        title: "Cannot cancel",
        text: "Only in progress or completed submissions can be cancelled by an admin.",
      });
      return;
    }

    const confirmed = await confirmAdminAction({
      title: "Cancel this handset submission?",
      text: "The employee will be notified in-app and by email. All admins will be copied on the email.",
      icon: "warning",
      confirmButtonText: "Yes, cancel submission",
    });

    if (!confirmed) return;

    try {
      setUpdatingId(row.id);
      await axiosInstance.put(`/handsets/submissions/${row.id}/admin-cancel`);
      await fetchActiveSubmissions();
      Swal.fire({
        icon: "success",
        title: "Cancelled",
        text: "The submission was cancelled and the employee was notified.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Cancel failed",
        text:
          error.response?.data?.message ||
          "Could not cancel this submission.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const rows = useMemo(() => {
    let filtered =
      statusFilter === "all"
        ? submissions
        : submissions.filter(
            (item) =>
              String(item.subscription_status || "")
                .trim()
                .toLowerCase() === statusFilter
          );

    const query = searchText.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((item) =>
        [
          item.employeeCode,
          item.FullName,
          item.employee_name,
          item.device,
          item.subscription_status,
          item.assignedAdminName,
        ].some((field) => String(field ?? "").toLowerCase().includes(query))
      );
    }

    return filtered.map(mapHandsetSubmissionRow);
  }, [submissions, statusFilter, searchText]);

  const columns = [
    { field: "employeeCode", headerName: "Employee Code", width: 140 },
    { field: "fullName", headerName: "Employee Name", width: 200 },
    { field: "device", headerName: "Device", width: 220 },
    { field: "device_price", headerName: "Device Price", width: 140 },
    { field: "excess_payment", headerName: "Excess Payment", width: 150 },
    {
      field: "contract_submitted_date",
      headerName: "Date Created",
      width: 150,
    },
    {
      field: "subscription_status",
      headerName: "Status",
      width: 140,
      renderCell: renderStatusCell,
    },
    {
      field: "assignedAdminName",
      headerName: "Attended By",
      width: 160,
    },
    {
      field: "isReceived",
      headerName: "Received",
      width: 110,
      renderCell: (params) => (params.row.isReceived ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 330,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View contract details">
            {renderContractViewButton({
              row: params.row,
              onView: setViewSubmission,
            })}
          </Tooltip>
          {renderContractStatusActionButton({
            row: params.row,
            ...statusActionProps,
          })}
          {renderContractCancelButton({
            row: params.row,
            updatingId,
            onCancel: handleAdminCancel,
          })}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px" className="handset-simulator-page admin-dashboard-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">New Handset Contracts</h2>
          <p className="handset-subtitle mb-0">
            Track staff handset requests, compare yearly volume, and advance
            applications through pending and in progress. Completed requests
            leave this list for processing elsewhere.
          </p>
        </div>
      </div>

      <Box
        className="admin-dashboard-grid"
        display="grid"
        gridTemplateColumns={isSmallScreen ? "repeat(1, 1fr)" : "repeat(12, 1fr)"}
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
          className="shadow admin-dashboard-card"
          gridColumn={isSmallScreen ? "span 12" : "span 3"}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <InfoBox
            title="Total Submissions"
            endpoint="/handsets/submissions/total"
            subtitle="All time"
          />
        </Box>

        <Box
          className="shadow admin-dashboard-card"
          gridColumn="span 12"
          gridRow="span 3"
        >
          <AirtimeSubmissionsYoYChart
            endpoint="/handsets/submissions/perMonth"
            titlePrefix="Handset submissions"
          />
        </Box>

        <Box
          className="shadow admin-dashboard-card handset-form-card"
          gridColumn="span 12"
          gridRow="span 4"
          sx={{ p: 2, minHeight: 420 }}
        >
          <Box
            className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3"
          >
            <h6 className="summary-title mb-0">Handset Submissions</h6>
            <Box className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
              <Box
                display="flex"
                borderRadius="8px"
                width={{ xs: "100%", sm: 260 }}
                sx={{ backgroundColor: colors.primary[400] }}
              >
                <InputBase
                  sx={{ ml: 2, flex: 1 }}
                  placeholder="Search submissions"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <IconButton type="button" sx={{ p: 1 }}>
                  <SearchIcon />
                </IconButton>
              </Box>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="handset-submission-status-filter-label">
                  Filter by status
                </InputLabel>
                <Select
                  labelId="handset-submission-status-filter-label"
                  value={statusFilter}
                  label="Filter by status"
                  onChange={(event) => setStatusFilter(event.target.value)}
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              minHeight="240px"
            >
              <CircularProgress sx={{ color: "#0096D6" }} />
            </Box>
          ) : (
            <Box
              height="360px"
              sx={{
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-cell": { borderBottom: "none" },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1674BB", color: "white",
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "none",
                  backgroundColor: colors.grey[900],
                },
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={8}
                rowsPerPageOptions={[8, 16, 24]}
                disableSelectionOnClick
              />
            </Box>
          )}
        </Box>
      </Box>

      <SubmissionViewDialog
        open={Boolean(viewSubmission)}
        onClose={() => setViewSubmission(null)}
        headerLabel="Handset contract"
        headerTitle={viewSubmission?.employeeCode}
        profile={
          viewSubmission
            ? {
                fullName: viewSubmission.fullName,
                metaLines: [viewSubmission.employeeCode],
              }
            : null
        }
        metaCards={
          viewSubmission
            ? [
                {
                  label: "Status",
                  value: <StatusBadge status={viewSubmission.subscription_status} />,
                },
                {
                  label: "Received",
                  value: viewSubmission.isReceived ? "Yes" : "No",
                },
                {
                  label: "Attended by",
                  value:
                    viewSubmission.assignedAdminName !== "-"
                      ? viewSubmission.assignedAdminName
                      : "Unassigned",
                },
              ]
            : []
        }
        sections={
          viewSubmission
            ? [
                {
                  title: "Device details",
                  icon: PhoneIphoneOutlinedIcon,
                  fields: [
                    { label: "Device", value: viewSubmission.device },
                    { label: "Device price", value: viewSubmission.device_price },
                    { label: "Excess payment", value: viewSubmission.excess_payment },
                  ],
                },
              ]
            : []
        }
        timeline={
          viewSubmission
            ? [{ label: "Submitted", date: viewSubmission.contract_submitted_date }]
            : []
        }
        actions={
          <Box display="flex" alignItems="center" gap={1}>
            {renderContractStatusActionButton({
              row: viewSubmission,
              ...statusActionProps,
            })}
            {renderContractCancelButton({
              row: viewSubmission,
              updatingId,
              onCancel: handleAdminCancel,
            })}
          </Box>
        }
      />
    </Box>
  );
};

export default AdminHandsetContracts;
