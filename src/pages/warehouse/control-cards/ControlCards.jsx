import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {
  Print as PrintIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../utils/axiosInstance';
import Swal from 'sweetalert2';
import formatDate from '../../../components/global/dateFormatter';
import StaffHandsetFormVoucher from '../../../components/global/StaffHandsetFormVoucher';

const ControlCards = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentUser = useSelector((state) => state.auth.user);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [selectedHandset, setSelectedHandset] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [collectionDate, setCollectionDate] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [collectionProofFile, setCollectionProofFile] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/handsets/control-cards');
      setData(response.data.data || []);
    } catch (err) {
      console.error('Error fetching control cards data:', err);
      setError('Failed to fetch control cards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return data;
    const q = filter.toLowerCase();
    return data.filter(
      (r) => 
        (r.RequestNumber && r.RequestNumber.toLowerCase().includes(q)) || 
        (r.EmployeeName && r.EmployeeName.toLowerCase().includes(q)) ||
        (r.EmployeeCode && r.EmployeeCode.toLowerCase().includes(q)) ||
        (r.MRNumber && r.MRNumber.toLowerCase().includes(q))
    );
  }, [data, filter]);

  const handlePrintControlCard = async (handset) => {
    try {
      // Get voucher data without marking as printed
      const response = await axiosInstance.get(`/handsets/control-card-data/${handset.id}`);

      if (response.data.success) {
        // Set voucher data and show modal
        setVoucherData(response.data.data);
        setVoucherModalOpen(true);
      }
    } catch (error) {
      console.error('Error getting control card data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to get control card data'
      });
    }
  };

  const handleActualPrint = async (handset) => {
    try {
      const response = await axiosInstance.post(`/handsets/print-control-card/${handset.id}`, {
        printedBy: currentUser.FullName
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Control Card Printed!',
          text: `Control card has been printed for ${handset.EmployeeName}`
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error printing control card:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to print control card'
      });
    }
  };

  const handlePrintVoucher = async () => {
    // Open print dialog
    window.print();
    
    // Mark as printed after print dialog is opened
    if (voucherData) {
      await handleActualPrint({ id: voucherData.handsetId, EmployeeName: voucherData.employeeName });
    }
  };

  const handleCloseVoucherModal = () => {
    setVoucherModalOpen(false);
    setVoucherData(null);
  };


  const handleUploadCollectionProof = (handset) => {
    setSelectedHandset(handset);
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setCollectedBy(handset.EmployeeName); // Pre-fill with employee name
    setUploadModalOpen(true);
  };

  const confirmUploadCollectionProof = async () => {
    if (!selectedHandset) return;

    if (!collectionProofFile) {
      Swal.fire({
        title: 'File Required!',
        text: 'Please select a file to upload as collection proof',
        icon: 'warning'
      });
      return;
    }

    if (!collectedBy || collectedBy.trim() === '') {
      Swal.fire({
        title: 'Collector Required!',
        text: 'Please enter the name of the person who collected the handset',
        icon: 'warning'
      });
      return;
    }

    // Validate file size (10MB max)
    if (collectionProofFile.size > 10 * 1024 * 1024) {
      Swal.fire({
        title: 'File Too Large!',
        text: 'File size must be less than 10MB',
        icon: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('uploadedBy', currentUser.FullName);
      formData.append('collectionDate', new Date().toISOString().split('T')[0]);
      formData.append('collectedBy', collectedBy.trim());
      formData.append('collectionProof', collectionProofFile);

      const response = await axiosInstance.post(`/handsets/upload-collection-proof/${selectedHandset.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Collection Proof Uploaded!',
          text: `Collection proof has been uploaded for ${selectedHandset.EmployeeName}`
        });
        setUploadModalOpen(false);
        setCollectionProofFile(null);
        setCollectedBy('');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error uploading collection proof:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload collection proof'
      });
    }
  };

  const columns = [
    { field: 'RequestNumber', headerName: 'Request #', width: 120 },
    { field: 'EmployeeCode', headerName: 'Employee Code', width: 130 },
    { field: 'EmployeeName', headerName: 'Employee Name', width: 180 },
    { field: 'HandsetName', headerName: 'Device', width: 150 },
    { field: 'MRNumber', headerName: 'MR Number', width: 120 },
    { field: 'FixedAssetCode', headerName: 'Asset Code', width: 130 },
    { 
      field: 'ControlCardPrinted', 
      headerName: 'Control Card', 
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon /> : <PendingIcon />}
          label={params.value ? 'Printed' : 'Pending'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    { 
      field: 'CollectionProofUploaded', 
      headerName: 'Collection Proof', 
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon /> : <PendingIcon />}
          label={params.value ? 'Uploaded' : 'Pending'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    { field: 'MRCreatedDate', headerName: 'MR Created', width: 120, renderCell: (params) => formatDate(params.value) },
    { 
      field: 'Status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const status = params.value;
        const finalStates = ["Collected", "MR Closed", "Completed"];
        const isFinal = finalStates.includes(status);
        
        return (
          <Chip
            label={status}
            color={isFinal ? "success" : "primary"}
            size="small"
            variant={isFinal ? "filled" : "outlined"}
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      getActions: (params) => {
        const actions = [];
        const row = params.row;

        // Print Control Card button - always available unless in final states
        const finalStates = ["Collected", "MR Closed", "Completed"];
        if (!finalStates.includes(row.Status)) {
          actions.push(
            <GridActionsCellItem
              icon={<PrintIcon />}
              label="Print Control Card"
              onClick={() => handlePrintControlCard(row)}
              color="primary"
            />
          );
        }


        // Upload Collection Proof button
        if (row.ControlCardPrinted && !row.CollectionProofUploaded && !finalStates.includes(row.Status)) {
          actions.push(
            <GridActionsCellItem
              icon={<UploadIcon />}
              label="Upload Collection Proof"
              onClick={() => handleUploadCollectionProof(row)}
              color="success"
            />
          );
        }

        return actions;
      },
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <TextField
          size="small"
          placeholder="Search control cards..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>
      <Box>
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );

  const summaryStats = useMemo(() => {
    const total = data.length;
    const controlCardPrinted = data.filter(h => h.ControlCardPrinted).length;
    const collectionProofUploaded = data.filter(h => h.CollectionProofUploaded).length;
    const readyForCollection = data.filter(h => h.ControlCardPrinted).length;
    const finalStates = ["Collected", "MR Closed", "Completed"];
    const inProgress = data.filter(h => !finalStates.includes(h.Status)).length;
    const completed = data.filter(h => finalStates.includes(h.Status)).length;

    return { total, controlCardPrinted, collectionProofUploaded, readyForCollection, inProgress, completed };
  }, [data]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Box>
          <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ mb: "5px" }}>
            Control Card Management
          </Typography>
          <Typography variant="h5" color={colors.greenAccent[400]}>
            Print control cards and manage device collection
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Devices
              </Typography>
              <Typography variant="h4" component="div">
                {summaryStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Control Cards Printed
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {summaryStats.controlCardPrinted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {summaryStats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Collection Proofs Uploaded
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {summaryStats.collectionProofUploaded}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {summaryStats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Box
        m="20px 0 0 0"
        height="55vh"
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
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          components={{ Toolbar: CustomToolbar }}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Box>

      {/* Staff Handset Form Voucher Modal */}
      <Dialog 
        open={voucherModalOpen} 
        onClose={handleCloseVoucherModal} 
        maxWidth="lg" 
        fullWidth
        fullScreen={false}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <PrintIcon color="primary" />
              <Typography variant="h6">Staff Handset Form Voucher</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintVoucher}
                color="primary"
              >
                Print
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseVoucherModal}
                color="inherit"
              >
                Close
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {voucherData && (
            <Box sx={{ p: 2 }}>
              <StaffHandsetFormVoucher 
                voucherData={voucherData} 
                isPrintMode={false}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Collection Proof Modal */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon color="success" />
            <Typography variant="h6">Upload Collection Proof</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedHandset && (
            <Box mb={2}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Employee:</strong> {selectedHandset.EmployeeName} ({selectedHandset.EmployeeCode})<br/>
                  <strong>Device:</strong> {selectedHandset.HandsetName}<br/>
                  <strong>MR Number:</strong> {selectedHandset.MRNumber}<br/>
                  <strong>Collection Date:</strong> {new Date().toLocaleDateString()}
                </Typography>
              </Alert>
              
              <TextField
                fullWidth
                label="Collected By (Handset Owner)"
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                margin="normal"
                placeholder="Enter the name of the person who collected the handset"
                helperText="This should be the employee who owns the handset"
                required
              />
              

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Signed Control Card
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setCollectionProofFile(e.target.files[0])}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This will mark the device as collected and send a notification to the employee.
                  Please upload the signed control card as proof of collection.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUploadModalOpen(false);
            setCollectedBy('');
            setCollectionProofFile(null);
          }} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmUploadCollectionProof} 
            color="success" 
            variant="contained"
            disabled={!collectionDate}
          >
            Upload Collection Proof
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ControlCards;
