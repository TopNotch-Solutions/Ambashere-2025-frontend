import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import InfoBox from "../../../components/admin/charts/InfoBox";
import AirtimeSubmissionsYoYChart from "../../../components/admin/charts/AirtimeSubmissionsYoYChart";
import axiosInstance from "../../../utils/axiosInstance";
import { tokens } from "../../../theme";
import { formatMoney } from "../../../utils/formatMoney";
import formatDate from "../../../components/global/dateFormatter";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/adminDashboard.css";

const NEXT_STATUS = {
  pending: "in progress",
  "in progress": "completed",
};

const AdminAirtimeContracts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleAdvanceStatus = async (row) => {
    const currentStatus = String(row.subscription_status || "")
      .trim()
      .toLowerCase();
    const nextStatus = NEXT_STATUS[currentStatus];

    if (!nextStatus) {
      Swal.fire({
        icon: "info",
        title: "No further update",
        text: "Completed submissions cannot be advanced further.",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Update status?",
      text: `Change status from "${currentStatus}" to "${nextStatus}"?`,
      showCancelButton: true,
      confirmButtonColor: "#0096D6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, update",
    });

    if (!result.isConfirmed) return;

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

  const rows = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? submissions
        : submissions.filter(
            (item) =>
              String(item.subscription_status || "")
                .trim()
                .toLowerCase() === statusFilter
          );

    return filtered.map((item, index) => ({
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
      device_monthly_price: formatMoney(item.device_monthly_price),
      serviceplan_monthly_price: formatMoney(item.serviceplan_monthly_price),
      contract_submitted_date: formatDate(item.contract_submitted_date),
      transaction_type: item.transaction_type || "-",
      subscription_status: item.subscription_status || "-",
    }));
  }, [submissions, statusFilter]);

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
    },
    {
      field: "actions",
      headerName: "Update Status",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const status = String(params.row.subscription_status || "")
          .trim()
          .toLowerCase();
        const nextStatus = NEXT_STATUS[status];
        const isCompleted = status === "completed" || !nextStatus;

        return (
          <Button
            size="small"
            variant="contained"
            disabled={isCompleted || updatingId === params.row.id}
            onClick={() => handleAdvanceStatus(params.row)}
            sx={{
              backgroundColor: isCompleted
                ? "#9CA3AF"
                : nextStatus === "in progress"
                  ? "#F59E0B"
                  : "#16A34A",
              textTransform: "none",
              color: "#fff",
              "&:hover": {
                backgroundColor: isCompleted
                  ? "#9CA3AF"
                  : nextStatus === "in progress"
                    ? "#D97706"
                    : "#15803D",
              },
              "&.Mui-disabled": {
                backgroundColor: isCompleted ? "#D1D5DB" : undefined,
                color: "#fff",
              },
            }}
          >
            {updatingId === params.row.id
              ? "Updating..."
              : isCompleted
                ? "Completed"
                : `Mark ${nextStatus}`}
          </Button>
        );
      },
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
              </Select>
            </FormControl>
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
                  backgroundColor: colors.grey[900],
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
    </Box>
  );
};

export default AdminAirtimeContracts;
