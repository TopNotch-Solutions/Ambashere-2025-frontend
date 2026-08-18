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
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
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

const mapAirtimeSubmissionRow = (item, index) => ({
  id: item.id ?? `submission-${index}`,
  employeeCode: item.employeeCode || "-",
  fullName: item.FullName || "-",
  package: item.package || "-",
  msisdn: item.msisdn || "-",
  device: item.device || "-",
  package_price: formatMoney(item.package_price),
  device_initail_cost: formatMoney(item.device_initail_cost),
  contract_duration: item.contract_duration
    ? String(Math.trunc(Number(item.contract_duration)))
    : "-",
  top_up_amount: formatMoney(item.top_up_amount),
  device_monthly_price: formatMoney(item.device_monthly_price),
  serviceplan_monthly_price: formatMoney(item.serviceplan_monthly_price),
  contract_submitted_date: formatDate(item.contract_submitted_date),
  transaction_type: item.transaction_type || "-",
  subscription_status: item.subscription_status || "-",
  assignedAdminCode: item.assignedAdminCode || null,
  assignedAdminName: item.assignedAdminName || "-",
});

const AdminAirtimeContracts = () => {
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
      const response = await axiosInstance.get("/contracts/submissions/active");
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching active airtime submissions:", error);
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
    setViewSubmission(mapAirtimeSubmissionRow(submissions[index], index));
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
      await axiosInstance.put(`/contracts/submissions/${row.id}/status`, {
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
          item.package,
          item.msisdn,
          item.device,
          item.subscription_status,
          item.assignedAdminName,
          item.transaction_type,
        ].some((field) => String(field ?? "").toLowerCase().includes(query))
      );
    }

    return filtered.map(mapAirtimeSubmissionRow);
  }, [submissions, statusFilter, searchText]);

  const columns = [
    { field: "employeeCode", headerName: "Employee Code", width: 130 },
    { field: "fullName", headerName: "Employee Name", width: 180 },
    { field: "package", headerName: "Package", width: 200 },
    { field: "msisdn", headerName: "MSISDN", width: 130 },
    { field: "device", headerName: "Device", width: 180 },
    { field: "package_price", headerName: "Package Price", width: 130 },
    {
      field: "device_initail_cost",
      headerName: "Device Cost",
      width: 130,
    },
    { field: "contract_duration", headerName: "Duration", width: 100 },
    {
      field: "top_up_amount",
      headerName: "Top-up",
      width: 130,
    },
    {
      field: "serviceplan_monthly_price",
      headerName: "Plan Monthly",
      width: 130,
    },
    {
      field: "device_monthly_price",
      headerName: "Device Monthly",
      width: 130,
    },
    {
      field: "contract_submitted_date",
      headerName: "Submitted",
      width: 140,
    },
    {
      field: "transaction_type",
      headerName: "Transaction Type",
      width: 160,
    },
    {
      field: "subscription_status",
      headerName: "Status",
      width: 130,
      renderCell: renderStatusCell,
    },
    {
      field: "assignedAdminName",
      headerName: "Attended By",
      width: 160,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 240,
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
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px" className="handset-simulator-page admin-dashboard-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Airtime Contracts</h2>
          <p className="handset-subtitle mb-0">
            Track airtime contract submissions, compare yearly volume, and
            advance active applications through pending, in progress, and
            completed.
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
            endpoint="/contracts/submissions/total"
            subtitle="All time"
          />
        </Box>

        <Box
          className="shadow admin-dashboard-card"
          gridColumn="span 12"
          gridRow="span 3"
        >
          <AirtimeSubmissionsYoYChart />
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
            <h6 className="summary-title mb-0">Airtime Submissions</h6>
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
                <InputLabel id="submission-status-filter-label">
                  Filter by status
                </InputLabel>
                <Select
                  labelId="submission-status-filter-label"
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
        headerLabel="Airtime contract"
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
                  title: "Contract details",
                  icon: DescriptionOutlinedIcon,
                  fields: [
                    { label: "Package", value: viewSubmission.package },
                    { label: "MSISDN", value: viewSubmission.msisdn },
                    { label: "Device", value: viewSubmission.device },
                    { label: "Transaction type", value: viewSubmission.transaction_type },
                    { label: "Package price", value: viewSubmission.package_price },
                    { label: "Device cost", value: viewSubmission.device_initail_cost },
                    {
                      label: "Contract duration",
                      value:
                        viewSubmission.contract_duration !== "-"
                          ? `${viewSubmission.contract_duration} months`
                          : "-",
                    },
                    { label: "Top-up", value: viewSubmission.top_up_amount },
                    { label: "Plan monthly", value: viewSubmission.serviceplan_monthly_price },
                    { label: "Device monthly", value: viewSubmission.device_monthly_price },
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
        actions={renderContractStatusActionButton({
          row: viewSubmission,
          ...statusActionProps,
        })}
      />
    </Box>
  );
};

export default AdminAirtimeContracts;
