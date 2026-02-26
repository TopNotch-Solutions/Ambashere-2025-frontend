import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, InputBase, useMediaQuery, useTheme, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Alert } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const AssetCodeAssignment = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedHandset, setSelectedHandset] = useState(null);
  const [fixedAssetCode, setFixedAssetCode] = useState("");
  const currentUser = useSelector((state) => state.auth.user);

  // Fetch data from API
  useEffect(() => {
    const fetchHandsetsForAssetCode = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/handsets/asset-code-assignment');
        console.log('API Response:', response.data);
        setData(response.data.data || response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching handsets for asset code assignment:', err);
        setError('Failed to load handsets');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHandsetsForAssetCode();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return data;
    const q = filter.toLowerCase();
    return data.filter(
      (r) => 
        (r.RequestNumber && r.RequestNumber.toLowerCase().includes(q)) || 
        (r.EmployeeName && r.EmployeeName.toLowerCase().includes(q)) ||
        (r.EmployeeCode && r.EmployeeCode.toLowerCase().includes(q))
    );
  }, [data, filter]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/handsets/asset-code-assignment');
      setData(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing handsets for asset code assignment:', err);
      setError('Failed to refresh handsets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAssetCode = (handset) => {
    setSelectedHandset(handset);
    setFixedAssetCode("");
    setAssignModalOpen(true);
  };

  const confirmAssignAssetCode = async () => {
    if (!selectedHandset || !fixedAssetCode.trim()) return;

    try {
      const response = await axiosInstance.post(`/handsets/issue-asset-code/${selectedHandset.id}`, {
        fixedAssetCode: fixedAssetCode.trim(),
        assignedBy: currentUser.FullName
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Asset Code Assigned!',
          text: `Asset Code ${fixedAssetCode} has been assigned to ${selectedHandset.EmployeeName}`
        });
        
        setAssignModalOpen(false);
        setFixedAssetCode("");
        handleRefresh(); // Refresh the data
      }
    } catch (error) {
      console.error('Error assigning fixed asset code:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to assign asset code'
      });
    }
  };

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "EmployeeName", headerName: "Employee", width: 180 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 140 },
    { field: "Device", headerName: "Device", width: 200 },
    { 
      field: "DevicePrice", 
      headerName: "Device Price", 
      width: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <AttachMoneyIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="bold">
            N${params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "AccessFeeAmount", 
      headerName: "Access Fee", 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="error" fontWeight="bold">
          N${params.value}
        </Typography>
      )
    },
    { 
      field: "PaymentConfirmedDate", 
      headerName: "Payment Confirmed", 
      width: 160,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: "RequestType", 
      headerName: "Request Type", 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'New' ? "primary" : "secondary"}
          variant="filled"
          size="small"
        />
      )
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<AssignmentIcon />}
          label="Assign Asset Code"
          onClick={() => handleAssignAssetCode(row)}
          color="primary"
        />
      ],
    },
  ];

  if (loading) {
    return (
      <Box m="2px" display="flex" justifyContent="center" alignItems="center" height="400px">
        <div>Loading handsets...</div>
      </Box>
    );
  }

  return (
    <Box m="2px">
      <Typography variant="h4" sx={{ mb: 2, color: colors.grey[100] }}>
        Asset Code Assignment
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
        Assign asset codes to handsets with confirmed payments
      </Typography>
      <div
        style={{
          height: 520,
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <Box
            className="d-flex col-md-5"
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
            width="260px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search by Request # or Employee"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button type="button" sx={{ p: 1, minWidth: 0 }}>
              <SearchIcon />
            </Button>
          </Box>
          
          <Button
            onClick={handleRefresh}
            variant="contained"
            sx={{
              backgroundColor: colors.blueAccent[600],
              color: "white",
              "&:hover": {
                backgroundColor: colors.blueAccent[700],
              },
            }}
          >
            <RefreshIcon sx={{ mr: 1 }} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${colors.grey[800]} !important`,
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
            "& .MuiDataGrid-toolbarContainer": {
              backgroundColor: colors.grey[900],
            },
          }}
        />
      </div>

      {/* Fixed Asset Code Assignment Modal */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Asset Code</DialogTitle>
        <DialogContent>
          {selectedHandset && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Handset Details</Typography>
              <Typography><strong>Employee:</strong> {selectedHandset.EmployeeName} ({selectedHandset.EmployeeCode})</Typography>
              <Typography><strong>Device:</strong> {selectedHandset.Device}</Typography>
              <Typography><strong>Device Price:</strong> N${selectedHandset.DevicePrice}</Typography>
              <Typography><strong>Access Fee:</strong> N${selectedHandset.AccessFeeAmount}</Typography>
              <Typography><strong>Payment Confirmed:</strong> {new Date(selectedHandset.PaymentConfirmedDate).toLocaleDateString()}</Typography>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter a valid asset code for this handset. This will mark the device as ready for collection.
          </Alert>

          <TextField
            fullWidth
            label="Asset Code"
            value={fixedAssetCode}
            onChange={(e) => setFixedAssetCode(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="e.g., FA-12345"
            helperText="Enter the asset code assigned to this device"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmAssignAssetCode} variant="contained" color="primary" disabled={!fixedAssetCode.trim()}>
            Assign Asset Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetCodeAssignment;