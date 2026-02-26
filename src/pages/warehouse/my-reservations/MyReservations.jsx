import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, useTheme, useMediaQuery, Button, CircularProgress, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import RefreshIcon from "@mui/icons-material/Refresh";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StoreIcon from "@mui/icons-material/Store";

const MyReservations = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [imeiModalOpen, setImeiModalOpen] = useState(false);
  const [selectedHandset, setSelectedHandset] = useState(null);
  const [imeiNumber, setImeiNumber] = useState("");
  const currentUser = useSelector((state) => state.auth.user);

  // Fetch my reserved devices
  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      console.log("Fetching my reserved devices for:", currentUser.FullName);
      const response = await axiosInstance.get(`/handsets/my-reserved-devices?reservedBy=${encodeURIComponent(currentUser.FullName)}`);
      
      if (response.data.success) {
        console.log("My reserved devices:", response.data.data);
        setData(response.data.data);
      } else {
        console.error("Failed to fetch my reserved devices:", response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to fetch reserved devices'
        });
      }
    } catch (error) {
      console.error('Error fetching my reserved devices:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch reserved devices'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMyReservations();
  };

  const handleIssueIMEI = (handset) => {
    setSelectedHandset(handset);
    setImeiModalOpen(true);
  };

  const confirmIssueIMEI = async () => {
    if (!imeiNumber || !/^\d{15}$/.test(imeiNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a valid 15-digit IMEI number'
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/handsets/issue-imei/${selectedHandset.id}`, {
        imeiNumber: imeiNumber,
        issuedBy: currentUser.FullName
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'IMEI Issued!',
          text: `IMEI ${imeiNumber} has been issued for ${selectedHandset.EmployeeName}'s device`
        });
        setImeiModalOpen(false);
        setImeiNumber("");
        fetchMyReservations(); // Refresh data
      }
    } catch (error) {
      console.error('Error issuing IMEI:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to issue IMEI'
      });
    }
  };

  // Filter data based on search
  const filtered = useMemo(() => {
    if (!filter) return data;
    return data.filter(item => 
      item.EmployeeName.toLowerCase().includes(filter.toLowerCase()) ||
      item.Device.toLowerCase().includes(filter.toLowerCase()) ||
      item.RequestNumber.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "EmployeeName", headerName: "Employee", width: 150 },
    { field: "Device", headerName: "Device", width: 180 },
    { field: "DevicePrice", headerName: "Price", width: 120 },
    { 
      field: "Store", 
      headerName: "Store", 
      width: 160,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <StoreIcon fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: "DeviceLocation", 
      headerName: "Location", 
      width: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: "CollectionStatus",
      headerName: "Collection Status",
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Ready for Collection' ? 'success' : 'warning'}
          variant="filled"
          size="small"
        />
      )
    },
    {
      field: "PaymentRequired",
      headerName: "Finance Payment",
      width: 160,
      renderCell: (params) => {
        if (params.row.PaymentRequired) {
          return (
            <Chip
              label={`Pay at Finance (N$${params.row.AccessFeeAmount})`}
              color="warning"
              variant="filled"
              size="small"
            />
          );
        }
        return (
          <Chip
            label="No Payment Required"
            color="success"
            variant="filled"
            size="small"
          />
        );
      }
    },
    { field: "IMEI", headerName: "IMEI", width: 180 },
    { field: "ReservedDate", headerName: "Reserved Date", width: 140 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: ({ row }) => {
        const actions = [];
        
        // Show issue IMEI action if device is reserved but IMEI not assigned
        if (row.CollectionStatus === 'Processing' && row.IMEI === 'Not assigned') {
          actions.push(
            <GridActionsCellItem
              icon={<PhoneIphoneIcon />}
              label="Issue IMEI"
              onClick={() => handleIssueIMEI(row)}
              color="primary"
            />
          );
        }
        
        return actions;
      },
    },
  ];

  return (
    <Box m="20px">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
            My Reserved Devices
          </Typography>
          <Typography variant="h5" color={colors.greenAccent[400]}>
            View and manage devices you have reserved
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ color: colors.grey[100], borderColor: colors.grey[100] }}
        >
          Refresh
        </Button>
      </Box>

      {/* Search Bar */}
      <Box display="flex" alignItems="center" gap={2} mt={2} mb={2}>
        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          borderRadius="3px"
          sx={{ flex: 1 }}
        >
          <input
            type="text"
            placeholder="Search by Employee, Device, or Request #"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: colors.grey[100],
              padding: "10px",
              fontSize: "16px"
            }}
          />
        </Box>
      </Box>

      {/* Data Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress size={40} sx={{ color: colors.blueAccent[500] }} />
          <Typography variant="h6" sx={{ ml: 2, color: colors.grey[100] }}>
            Loading your reserved devices...
          </Typography>
        </Box>
      ) : data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px" flexDirection="column">
          <Typography variant="h6" color={colors.grey[100]} gutterBottom>
            No Reserved Devices
          </Typography>
          <Typography variant="body2" color={colors.grey[300]} textAlign="center">
            You haven't reserved any devices yet.
            <br />
            Go to Device Allocations to reserve devices for employees.
          </Typography>
        </Box>
      ) : (
        <Box m="20px 0 0 0" height="55vh" sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.grey[900], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.grey[900], borderTop: "none" },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
        }}>
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
        </Box>
      )}

      {/* Summary */}
      {data.length > 0 && (
        <Box mt={2} p={2} sx={{ backgroundColor: colors.grey[800], borderRadius: 1 }}>
          <Typography variant="h6" color={colors.grey[100]} gutterBottom>
            Summary
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Typography variant="body2" color={colors.grey[300]}>
              Total Reserved: {data.length}
            </Typography>
            <Typography variant="body2" color={colors.greenAccent[400]}>
              Ready for Collection: {data.filter(d => d.CollectionStatus === 'Ready for Collection').length}
            </Typography>
            <Typography variant="body2" color={colors.blueAccent[400]}>
              Processing: {data.filter(d => d.CollectionStatus === 'Processing').length}
            </Typography>
            <Typography variant="body2" color={colors.redAccent[400]}>
              Payment Required: {data.filter(d => d.PaymentRequired).length}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Issue IMEI Modal */}
      <Dialog open={imeiModalOpen} onClose={() => setImeiModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue IMEI</DialogTitle>
        <DialogContent>
          {selectedHandset && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Device Details</Typography>
              <Typography><strong>Employee:</strong> {selectedHandset.EmployeeName}</Typography>
              <Typography><strong>Device:</strong> {selectedHandset.Device}</Typography>
              <Typography><strong>Store:</strong> {selectedHandset.Store}</Typography>
              <Typography><strong>Location:</strong> {selectedHandset.DeviceLocation}</Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="IMEI Number"
            value={imeiNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 15) {
                setImeiNumber(value);
              }
            }}
            variant="outlined"
            margin="normal"
            placeholder="Enter 15-digit IMEI number"
            inputProps={{
              maxLength: 15,
              style: { fontFamily: 'monospace', fontSize: '16px' }
            }}
            helperText={`${imeiNumber.length}/15 digits entered`}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImeiModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmIssueIMEI} variant="contained" color="primary">
            Issue IMEI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReservations;
