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
        console.log(response.data)
        setData(response.data);
      } catch (error) {
        // console.log(error);
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
      const packageData = data.find(pkg => pkg.PackageID === packageId);
      if (!packageData) {
        console.error("Package not found");
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Package not found in current data.",
          confirmButtonText: "OK"
        });
        return;
      }

      console.log("Toggling package:", {
        packageId,
        currentStatus,
        packageData,
        newStatus: !currentStatus
      });

      const updatePayload = {
        PackageName: packageData.PackageName,
        PaymentPeriod: parseInt(packageData.PaymentPeriod), // Convert to number
        MonthlyPrice: parseFloat(packageData.MonthlyPrice), // Convert to number
        IsActive: !currentStatus
      };

      console.log("Update payload:", updatePayload);

      const response = await axiosInstance.put(`/packages/updatePackage/${packageId}`, updatePayload);
      
      if (response.status === 200) {
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Package "${packageData.PackageName}" has been ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh data
        const fetchData = async () => {
          try {
            const response = await axiosInstance.get(`/packages`);
            setData(response.data);
          } catch (error) {
            console.error("Error refreshing data:", error);
          }
        };
        fetchData();
      }
    } catch (error) {
      console.error("Error toggling package status:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Show error message to user
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: `Failed to update package status: ${error.response?.data?.message || error.message}`,
        confirmButtonText: "OK"
      });
    }
  };

  const columns = [
    { field: "PackageID", headerName: "#", width: 100 },
    { field: "PackageName", headerName: "Package Name", width: 250 },
    { field: "PaymentPeriod", headerName: "Payment Period", width: 200 },
    { field: "MonthlyPrice", headerName: "Package Price", width: 180 },
    { 
      field: "IsActive", 
      headerName: "Status", 
      width: 120,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {params.value ? (
            <>
              <ToggleOnIcon style={{ color: '#4caf50', fontSize: '24px' }} />
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Active</span>
            </>
          ) : (
            <>
              <ToggleOffIcon style={{ color: '#f44336', fontSize: '24px' }} />
              <span style={{ color: '#f44336', fontWeight: 'bold' }}>Inactive</span>
            </>
          )}
        </div>
      )
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 250,
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
          icon={row.IsActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
          label={row.IsActive ? "Deactivate" : "Activate"}
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
      ],
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
    <Box m="2px" className="">
      <div
        style={{
          height: 500,
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* <h3>Employees</h3> */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
            width="200px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search"
              onChange={handleSearchChange}
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
          {currentUser.RoleID === 1 ? (
            <div className="d-flex col-md-4 justify-content-between">
              <Button
                style={{
                  gap: "10px",
                  height: "100%",
                  backgroundColor: "#0096D6",
                  color: "#fff",
                  padding: "8px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  borderColor: "#1A69AC",
                  border: "1px solid",
                }}
                onClick={handleAddNewPackage}
              >
                Add Package
                <AddCircleIcon size={16} />
              </Button>
              <ExportButton data={rows} fileName="Packages" />
            </div>
          ) : (
            <p></p>
          )}
        </div>

        <Box
          m="20px 0 0 0"
          height="55vh"
          //   width = "80%"
          //   margin = "auto"
          //   marginTop={"10px"}
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
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
          />
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
