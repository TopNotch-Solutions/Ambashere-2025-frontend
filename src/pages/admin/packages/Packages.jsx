import { Box, IconButton, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import axiosInstance from "../../../utils/axiosInstance";
import AddPackage from "../../../components/admin/AddPackage";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";
import "../../../assets/style/global/adminPackages.css";

const AdminPackages = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/packages`);
        setData(response.data);
      } catch (error) {
        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

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

  const handleToggleActive = async (packageId, currentStatus) => {
    try {
      const packageData = data.find(
        (pkg) => String(pkg.PackageID) === String(packageId)
      );
      if (!packageData) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Package not found in current data.",
          confirmButtonText: "OK",
        });
        return;
      }

      const paymentPeriod = String(packageData.PaymentPeriod || "").replace(
        /\s*months?/i,
        ""
      );
      const monthlyPrice = parseFloat(
        String(packageData.MonthlyPrice).replace(/[^\d.-]/g, "")
      );
      const isCurrentlyActive =
        currentStatus === true ||
        currentStatus === 1 ||
        currentStatus === "1" ||
        currentStatus === "true";

      const hasDeviceLimit =
        packageData.HasDeviceLimit === true ||
        packageData.HasDeviceLimit === 1 ||
        packageData.HasDeviceLimit === "1" ||
        packageData.HasDeviceLimit === "true";

      const updatePayload = {
        PackageName: packageData.PackageName,
        PaymentPeriod: parseInt(paymentPeriod, 10),
        MonthlyPrice: monthlyPrice,
        IsActive: !isCurrentlyActive,
        AllowsDevice:
          packageData.AllowsDevice === undefined ||
          packageData.AllowsDevice === null
            ? true
            : packageData.AllowsDevice === true ||
              packageData.AllowsDevice === 1 ||
              packageData.AllowsDevice === "1" ||
              packageData.AllowsDevice === "true",
        HasDeviceLimit: hasDeviceLimit,
        DeviceLimit: hasDeviceLimit
          ? parseFloat(packageData.DeviceLimit) || null
          : null,
      };

      const response = await axiosInstance.put(
        `/packages/updatePackage/${packageId}`,
        updatePayload
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Package "${packageData.PackageName}" has been ${
            !isCurrentlyActive ? "activated" : "deactivated"
          } successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });

        const refreshResponse = await axiosInstance.get(`/packages`);
        setData(refreshResponse.data);
      }
    } catch (error) {
      console.error("Error toggling package status:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to update package status: ${
          error.response?.data?.message || error.message
        }`,
        confirmButtonText: "OK",
      });
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
            : params.value === true ||
              params.value === 1 ||
              params.value === "1" ||
              params.value === "true";
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
        const hasLimit =
          params.row.HasDeviceLimit === true ||
          params.row.HasDeviceLimit === 1 ||
          params.row.HasDeviceLimit === "1" ||
          params.row.HasDeviceLimit === "true";
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
        const isActive =
          params.value === true ||
          params.value === 1 ||
          params.value === "1" ||
          params.value === "true";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isActive ? (
              <>
                <ToggleOnIcon style={{ color: "#4caf50", fontSize: "24px" }} />
                <span style={{ color: "#4caf50", fontWeight: "bold" }}>Active</span>
              </>
            ) : (
              <>
                <ToggleOffIcon style={{ color: "#f44336", fontSize: "24px" }} />
                <span style={{ color: "#f44336", fontWeight: "bold" }}>Inactive</span>
              </>
            )}
          </div>
        );
      }
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 250,
      cellClassName: "actions",
      getActions: ({ row }) => {
        const isActive =
          row.IsActive === true ||
          row.IsActive === 1 ||
          row.IsActive === "1" ||
          row.IsActive === "true";
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEditClick(row)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
            label={isActive ? "Deactivate" : "Activate"}
            className="textPrimary"
            onClick={() => handleToggleActive(row.PackageID, row.IsActive)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<RemoveCircleIcon />}
            label="Remove"
            className="textPrimary"
            onClick={() => handleRemoveClick(row)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const rows = data.map((bundle) => ({
    id: bundle.PackageID,
    PackageID: bundle.PackageID,
    PackageName: bundle.PackageName,
    PaymentPeriod: bundle.PaymentPeriod + " months",
    MonthlyPrice: "N$ " + bundle.MonthlyPrice,
    IsActive: bundle.IsActive,
  }));

  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);

  const handleSearchChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearchText(searchText);

    const filteredData =
      searchText === ""
        ? data
        : data.filter(
            (packages) =>
              packages.PackageName.toLowerCase().includes(searchText) ||
            packages.PackageName.toLowerCase().includes(searchText)
          );

    setFilteredRows(
      filteredData.map((packages) => ({
        ...packages,
        id: packages.PackageID,
        PaymentPeriod: packages.PaymentPeriod + " months",
      }))
    );
  };

  useEffect(() => {
    setFilteredRows(
      data.map((packages) => ({
        ...packages,
        id: packages.PackageID,
        PaymentPeriod: packages.PaymentPeriod + " months",
      }))
    );
  }, [data]);

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
          {currentUser.RoleID === 1 ? (
            <div className="d-flex col-md-4 justify-content-between admin-packages-actions">
              <Button
                className="benefits-cta-btn"
                onClick={handleAddNewPackage}
              >
                Add Package
                <AddCircleIcon size={16} />
              </Button>
              <ExportButton data={rows} fileName="Packages" className="benefits-cta-btn" />
            </div>
          ) : (
            <p></p>
          )}
        </div>

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
              checkboxSelection
              disableSelectionOnClick
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
