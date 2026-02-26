import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, InputBase, useMediaQuery, useTheme, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Alert } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const PaymentApproval = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [filter, setFilter] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedHandset, setSelectedHandset] = useState(null);
  const [notes, setNotes] = useState("");
  const currentUser = useSelector((state) => state.auth.user);

  // Fetch data from API
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/handsets/pending-payments');
        console.log('API Response:', response.data);
        setData(response.data.data || response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
        setError('Failed to load pending payments');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
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
      const response = await axiosInstance.get('/handsets/pending-payments');
      setData(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing pending payments:', err);
      setError('Failed to refresh pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (handset) => {
    setSelectedHandset(handset);
    setNotes("");
    setConfirmModalOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedHandset) return;

    try {
      const response = await axiosInstance.post(`/handsets/confirm-payment/${selectedHandset.id}`, {
        confirmedBy: currentUser.FullName,
        notes: notes
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Payment Confirmed!',
          text: `Payment of N$${selectedHandset.AccessFeeAmount} has been confirmed for ${selectedHandset.EmployeeName}`
        });
        
        setConfirmModalOpen(false);
        setNotes("");
        handleRefresh(); // Refresh the data
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to confirm payment'
      });
    }
  };

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "EmployeeName", headerName: "Employee", width: 180 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 140 },
    { field: "Device", headerName: "Device", width: 200 },
    { field: "DevicePrice", headerName: "Device Price", width: 140 },
    { 
      field: "AccessFeeAmount", 
      headerName: "Outstanding Amount", 
      width: 160,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <AttachMoneyIcon fontSize="small" color="error" />
          <Typography variant="body2" color="error" fontWeight="bold">
            N${params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "RequestDate", 
      headerName: "Request Date", 
      width: 140,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<CheckCircleIcon />}
          label="Confirm Payment"
          onClick={() => handleConfirmPayment(row)}
          color="success"
        />
      ],
    },
  ];

  if (loading) {
    return (
      <Box m="2px" display="flex" justifyContent="center" alignItems="center" height="400px">
        <div>Loading pending payments...</div>
      </Box>
    );
  }

  return (
    <Box m="2px">
      <Typography variant="h4" sx={{ mb: 2, color: colors.grey[100] }}>
        Payment Approval
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
        Showing handsets with Access Fee greater than 0 and Limit Checked = true that require payment confirmation
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

      {/* Payment Confirmation Modal */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Payment Received</DialogTitle>
        <DialogContent>
          {selectedHandset && (
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Typography><strong>Employee:</strong> {selectedHandset.EmployeeName} ({selectedHandset.EmployeeCode})</Typography>
              <Typography><strong>Device:</strong> {selectedHandset.Device}</Typography>
              <Typography><strong>Device Price:</strong> N${selectedHandset.DevicePrice}</Typography>
              <Typography><strong>Access Fee:</strong> N${selectedHandset.AccessFeeAmount}</Typography>
              <Typography><strong>Request Date:</strong> {new Date(selectedHandset.RequestDate).toLocaleDateString()}</Typography>
            </Box>
          )}
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please verify that the payment has been received in the Finance Department before confirming.
          </Alert>

          <TextField
            fullWidth
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="Add any notes about the payment confirmation"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmPayment} variant="contained" color="success">
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentApproval;
