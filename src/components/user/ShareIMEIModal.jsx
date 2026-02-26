import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

const ShareIMEIModal = ({
  open,
  handleClose,
  handsetData,
  onShareIMEI
}) => {
  const [imeiNumber, setImeiNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCloseModal = () => {
    setImeiNumber('');
    setError(null);
    handleClose();
  };

  const handleShareIMEI = async () => {
    // Validate IMEI number (15 digits)
    if (!imeiNumber || !/^\d{15}$/.test(imeiNumber)) {
      setError('Please enter a valid 15-digit IMEI number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onShareIMEI(handsetData.id, imeiNumber);
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to share IMEI number');
    } finally {
      setLoading(false);
    }
  };

  const handleImeiChange = (event) => {
    const value = event.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 15) {
      setImeiNumber(value);
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIphoneIcon color="primary" />
            <Typography variant="h6">Share Device IMEI</Typography>
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box mb={3}>
          <Typography variant="body1" paragraph>
            Your renewal has been verified! Please share your device's IMEI number with the admin team for verification.
          </Typography>
          
          <Box p={2} bgcolor="grey.100" borderRadius={1} mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Device Information:
            </Typography>
            <Typography variant="body2">
              <strong>Device:</strong> {handsetData?.HandsetName}
            </Typography>
            <Typography variant="body2">
              <strong>Price:</strong> N${handsetData?.HandsetPrice}
            </Typography>
            <Typography variant="body2">
              <strong>Request Type:</strong> {handsetData?.RequestType}
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Enter IMEI Number
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please enter the 15-digit IMEI number found on your device or in the device settings.
          </Typography>

          <TextField
            fullWidth
            label="IMEI Number"
            value={imeiNumber}
            onChange={handleImeiChange}
            variant="outlined"
            placeholder="Enter 15-digit IMEI number"
            error={!!error}
            helperText={
              error 
                ? error 
                : `${imeiNumber.length}/15 digits entered`
            }
            inputProps={{
              maxLength: 15,
              style: { 
                fontFamily: 'monospace',
                fontSize: '16px',
                letterSpacing: '1px'
              }
            }}
          />
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>How to find your IMEI:</strong>
            <br />
            • Dial *#06# on your phone
            <br />
            • Check Settings → About Phone → Status
            <br />
            • Look on the device box or back of the device
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleCloseModal} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleShareIMEI}
          disabled={loading || imeiNumber.length !== 15}
          variant="contained"
          color="primary"
          startIcon={<PhoneIphoneIcon />}
        >
          {loading ? 'Sharing...' : 'Share IMEI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareIMEIModal;
