import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const RenewalVerificationModal = ({
  open,
  handleClose,
  handsetData,
  onVerify
}) => {
  const [verificationDecision, setVerificationDecision] = useState('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [renewalDate, setRenewalDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCloseModal = () => {
    setVerificationDecision('approve');
    setRejectionReason('');
    setRenewalDate(null);
    setError(null);
    handleClose();
  };

  const handleVerify = async () => {
    if (verificationDecision === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    if (verificationDecision === 'reject' && !renewalDate) {
      setError('Please select a renewal date for when the user can try again');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verificationData = {
        approved: verificationDecision === 'approve',
        rejectionReason: verificationDecision === 'reject' ? rejectionReason : null,
        renewalDate: verificationDecision === 'reject' ? renewalDate : null,
        verifiedBy: 'Finance Team',
        notes: verificationDecision === 'approve' 
          ? `Renewal verified by finance team` 
          : `Renewal rejected: ${rejectionReason}. Next renewal date: ${renewalDate?.toLocaleDateString()}`
      };

      await onVerify(handsetData.id, verificationData);
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to verify renewal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRenewalDateInfo = () => {
    // Check both possible field names for renewal date
    const renewalDateStr = handsetData?.RenewalContext?.renewalDate || handsetData?.RenewalDate;
    if (!renewalDateStr) return null;
    
    const renewalDate = new Date(renewalDateStr);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    
    return {
      renewalDate: formatDate(renewalDateStr),
      daysUntilRenewal,
      isOverdue: daysUntilRenewal < 0,
      isDue: daysUntilRenewal <= 30
    };
  };

  const renewalInfo = getRenewalDateInfo();

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <RefreshIcon color="primary" />
          <Typography variant="h6">Renewal Verification</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}


        {/* Renewal Date Information */}
        {renewalInfo && (
          <Box mb={3} p={2} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Renewal Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Renewal Date:</strong> {renewalInfo.renewalDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Days Until Renewal:</strong> {renewalInfo.daysUntilRenewal} days
            </Typography>
            {renewalInfo.isOverdue && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This renewal is overdue by {Math.abs(renewalInfo.daysUntilRenewal)} days
              </Alert>
            )}
            {renewalInfo.isDue && !renewalInfo.isOverdue && (
              <Alert severity="info" sx={{ mt: 1 }}>
                This renewal is due soon
              </Alert>
            )}
          </Box>
        )}

        {/* Verification Decision */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Renewal Verification Decision
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please verify if this renewal request is approved based on the renewal date and business rules.
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={verificationDecision}
              onChange={(e) => {
                setVerificationDecision(e.target.value);
                if (e.target.value === 'approve') {
                  setRejectionReason('');
                }
              }}
            >
              <FormControlLabel
                value="approve"
                control={<Radio color="success" />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" />
                    <Typography>Approve Renewal</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="reject"
                control={<Radio color="error" />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CancelIcon color="error" />
                    <Typography>Reject Renewal</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Renewal Date Picker - Only show when rejecting */}
        {verificationDecision === 'reject' && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Set Renewal Date
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select the date when this user will be due for their next renewal attempt.
            </Typography>
            
            <TextField
              fullWidth
              type="date"
              label="Renewal Date"
              value={renewalDate ? renewalDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setRenewalDate(e.target.value ? new Date(e.target.value) : null)}
              variant="outlined"
              error={verificationDecision === 'reject' && !renewalDate}
              helperText={
                verificationDecision === 'reject' && !renewalDate
                  ? 'Please select a renewal date'
                  : 'Select when the user can try renewal again'
              }
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split('T')[0] // Can't select past dates
              }}
            />
          </Box>
        )}

        {/* Rejection Reason */}
        {verificationDecision === 'reject' && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Rejection Reason *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejection..."
              variant="outlined"
              error={verificationDecision === 'reject' && !rejectionReason.trim()}
              helperText={
                verificationDecision === 'reject' && !rejectionReason.trim()
                  ? 'Rejection reason is required'
                  : 'This reason will be sent to the employee'
              }
            />
          </Box>
        )}

        {/* Default Rejection Message with Renewal Date */}
        {verificationDecision === 'reject' && renewalInfo && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Suggested Message:</strong> "Your renewal request has been rejected. Your current renewal date is {renewalInfo.renewalDate}. Please contact finance for more information."
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleCloseModal} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleVerify}
          disabled={loading}
          variant="contained"
          color={verificationDecision === 'approve' ? 'success' : 'error'}
        >
          {loading ? 'Verifying...' : verificationDecision === 'approve' ? 'Approve Renewal' : 'Reject Renewal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenewalVerificationModal;
