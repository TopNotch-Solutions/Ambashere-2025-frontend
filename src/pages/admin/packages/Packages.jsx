import { Box, IconButton, Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import axiosInstance from "../../../utils/axiosInstance";
import AddPackage from "../../../components/admin/AddPackage";
import { useSelector, useDispatch } from "react-redux";
import { StatusBadge } from "../../../utils/statusBadge";
import { confirmAdminAction } from "../../../utils/adminConfirm";
import Swal from "sweetalert2";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";
import "../../../assets/style/global/adminPackages.css";

const isTruthy = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

function buildPackageUpdatePayload(packageData, overrides = {}) {
  const paymentPeriod = String(packageData.PaymentPeriod || "").replace(
    /\s*months?/i,
    ""
  );
  const monthlyPrice = parseFloat(
    String(packageData.MonthlyPrice).replace(/[^\d.-]/g, "")
  );
  const hasDeviceLimit = isTruthy(packageData.HasDeviceLimit);

  return {
    PackageName: packageData.PackageName,
    PaymentPeriod: parseInt(paymentPeriod, 10),
    MonthlyPrice: monthlyPrice,
    IsActive:
      overrides.IsActive !== undefined
        ? overrides.IsActive
        : isTruthy(packageData.IsActive),
    AllowsDevice:
      packageData.AllowsDevice === undefined ||
      packageData.AllowsDevice === null
        ? true
        : isTruthy(packageData.AllowsDevice),
    HasDeviceLimit: hasDeviceLimit,
    DeviceLimit: hasDeviceLimit
      ? parseFloat(packageData.DeviceLimit) || null
      : null,
  };
}

function mapPackageToRow(pkg) {
  return {
    ...pkg,
    id: pkg.PackageID,
    PaymentPeriod: `${pkg.PaymentPeriod} months`,
    MonthlyPrice: `N$ ${pkg.MonthlyPrice}`,
  };
}

const AdminPackages = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const isAdmin = currentUser?.RoleID === 1;

  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const handleClose = () => setModalOpen(false);

  const fetchPackages = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/packages`);
      setData(response.data);
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [dispatch, fetchPackages]);

  const handleAddNewPackage = () => {
    setModalMode("add");
    setModalOpen(true);
    setCurrentPackage({});
  };

  const handleEditClick = (packages) => {
    setCurrentPackage(packages);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleRemoveClick = (packages) => {
    setCurrentPackage(packages);
    setModalMode("remove");
    setModalOpen(true);
  };

  const getSelectedPackages = useCallback(() => {
    const idSet = new Set(selectedIds.map(String));
    return data.filter((pkg) => idSet.has(String(pkg.PackageID)));
  }, [data, selectedIds]);

  const refreshAfterBulk = async () => {
    await fetchPackages();
    setSelectedIds([]);
  };

  const runBulkStatusUpdate = async (isActive) => {
    const selected = getSelectedPackages();
    if (selected.length === 0) return;

    const actionLabel = isActive ? "activate" : "deactivate";
    const confirmed = await confirmAdminAction({
      title: `${isActive ? "Activate" : "Deactivate"} selected packages?`,
      text: `${selected.length} package(s) will be ${actionLabel}d.`,
      confirmButtonText: isActive ? "Activate selected" : "Deactivate selected",
    });
    if (!confirmed) return;

    setBulkProcessing(true);
    const failures = [];

    try {
      await Promise.all(
        selected.map(async (pkg) => {
          try {
            await axiosInstance.put(
              `/packages/updatePackage/${pkg.PackageID}`,
              buildPackageUpdatePayload(pkg, { IsActive: isActive })
            );
          } catch (error) {
            failures.push({
              name: pkg.PackageName,
              message:
                error.response?.data?.message ||
                error.message ||
                "Update failed",
            });
          }
        })
      );

      await refreshAfterBulk();

      if (failures.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `${selected.length} package(s) ${actionLabel}d successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partially updated",
          text: `${selected.length - failures.length} succeeded, ${failures.length} failed.`,
        });
      }
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkActivate = () => runBulkStatusUpdate(true);
  const handleBulkDeactivate = () => runBulkStatusUpdate(false);

  const handleBulkDelete = async () => {
    const selected = getSelectedPackages();
    if (selected.length === 0) return;

    const confirmed = await confirmAdminAction({
      icon: "warning",
      title: "Delete selected packages?",
      text: `${selected.length} package(s) will be permanently removed.`,
      confirmButtonText: "Delete selected",
    });
    if (!confirmed) return;

    setBulkProcessing(true);
    const failures = [];

    try {
      await Promise.all(
        selected.map(async (pkg) => {
          try {
            await axiosInstance.delete(
              `/packages/removePackage/${pkg.PackageID}`
            );
          } catch (error) {
            failures.push({
              name: pkg.PackageName,
              message:
                error.response?.data?.message ||
                error.message ||
                "Delete failed",
            });
          }
        })
      );

      await refreshAfterBulk();

      if (failures.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: `${selected.length} package(s) deleted successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partially deleted",
          text: `${selected.length - failures.length} deleted, ${failures.length} failed.`,
        });
      }
    } finally {
      setBulkProcessing(false);
    }
  };

  const columns = [
    { field: "PackageID", headerName: "#", width: 100 },
    { field: "PackageName", headerName: "Package Name", width: 250 },
    { field: "PaymentPeriod", headerName: "Payment Period", width: 200 },
    { field: "MonthlyPrice", headerName: "Package Price", width: 180 },
    {
      field: "AllowsDevice",
      headerName: "Allows Device",
      width: 140,
      renderCell: (params) => {
        const allowsDevice =
          params.value === undefined || params.value === null
            ? true
            : isTruthy(params.value);
        return (
          <span
            style={{
              color: allowsDevice ? "#4caf50" : "#f44336",
              fontWeight: "bold",
            }}
          >
            {allowsDevice ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      field: "DeviceLimit",
      headerName: "Device Limit",
      width: 140,
      renderCell: (params) => {
        const hasLimit = isTruthy(params.row.HasDeviceLimit);
        if (!hasLimit || params.value === null || params.value === undefined) {
          return <span style={{ color: "#757575" }}>No limit</span>;
        }
        return (
          <span style={{ fontWeight: "bold" }}>
            N$ {parseFloat(params.value).toLocaleString()}
          </span>
        );
      },
    },
    {
      field: "IsActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const active = isTruthy(params.value);
        return <StatusBadge status={active ? "Active" : "Inactive"} />;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      cellClassName: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={() => handleEditClick(row)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<RemoveCircleIcon />}
          label="Remove"
          className="textPrimary"
          onClick={() => handleRemoveClick(row)}
          color="inherit"
        />,
      ],
    },
  ];

  const rows = useMemo(() => data.map(mapPackageToRow), [data]);

  const handleSearchChange = (event) => {
    const nextSearch = event.target.value.toLowerCase();
    setSearchText(nextSearch);
    setSelectedIds([]);

    const filteredData =
      nextSearch === ""
        ? data
        : data.filter((pkg) =>
            pkg.PackageName.toLowerCase().includes(nextSearch)
          );

    setFilteredRows(filteredData.map(mapPackageToRow));
  };

  useEffect(() => {
    const filteredData =
      searchText === ""
        ? data
        : data.filter((pkg) =>
            pkg.PackageName.toLowerCase().includes(searchText)
          );
    setFilteredRows(filteredData.map(mapPackageToRow));
  }, [data, searchText]);

  return (
    <Box m="2px" className="handset-simulator-page admin-packages-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Packages</h2>
          <p className="handset-subtitle mb-0">
            Configure package plans, pricing periods, and activation status.
          </p>
        </div>
      </div>
      <div className="admin-packages-wrap">
        <div className="d-flex justify-content-between admin-packages-toolbar">
          <Box
            className="admin-packages-search"
            display="flex"
            borderRadius="8px"
            width="260px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search package"
              onChange={handleSearchChange}
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
          {isAdmin ? (
            <div className="d-flex col-md-4 justify-content-between admin-packages-actions">
              <Button
                className="benefits-cta-btn"
                onClick={handleAddNewPackage}
              >
                Add Package
                <AddCircleIcon size={16} />
              </Button>
              <ExportButton
                data={rows}
                fileName="Packages"
                className="benefits-cta-btn"
              />
            </div>
          ) : (
            <p></p>
          )}
        </div>

        {isAdmin && selectedIds.length > 0 && (
          <Box
            className="admin-packages-bulk-actions"
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            gap={1.5}
            mt={2}
            p={1.5}
            sx={{
              backgroundColor: colors.primary[400],
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
              {selectedIds.length} selected
            </Typography>
            <Button
              size="small"
              variant="contained"
              disabled={bulkProcessing}
              onClick={handleBulkActivate}
              sx={{
                backgroundColor: "#16A34A",
                textTransform: "none",
                "&:hover": { backgroundColor: "#15803D" },
              }}
            >
              Activate
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={bulkProcessing}
              onClick={handleBulkDeactivate}
              sx={{
                backgroundColor: "#F59E0B",
                textTransform: "none",
                "&:hover": { backgroundColor: "#D97706" },
              }}
            >
              Deactivate
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={bulkProcessing}
              onClick={handleBulkDelete}
              sx={{
                backgroundColor: "#DC2626",
                textTransform: "none",
                "&:hover": { backgroundColor: "#B91C1C" },
              }}
            >
              Delete
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={bulkProcessing}
              onClick={() => setSelectedIds([])}
              sx={{ textTransform: "none", ml: "auto" }}
            >
              Clear selection
            </Button>
          </Box>
        )}

        <Box
          m="20px 0 0 0"
          height="55vh"
          className="handset-form-card shadow-sm benefits-table-card"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#1674BB",
              color: "white",
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.grey[900],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <div className="benefits-grid-wrap">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection={isAdmin}
              disableSelectionOnClick
              selectionModel={selectedIds}
              onSelectionModelChange={(newSelection) =>
                setSelectedIds(newSelection)
              }
              loading={bulkProcessing}
            />
          </div>
        </Box>
        {modalOpen && (
          <div className="modal">
            <div className="modal-content">
              <AddPackage
                style={{ height: "100%" }}
                open={modalOpen}
                handleClose={handleClose}
                mode={modalMode}
                packageData={currentPackage}
              />
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default AdminPackages;
