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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from 'react-redux';

const ProbationVerificationModal = ({ 
  open, 
  handleClose, 
  handsetData, 
  onVerify 
}) => {
  const [verificationDecision, setVerificationDecision] = useState('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentUser = useSelector((state) => state.auth.user);

  const handleSubmit = async () => {
    if (verificationDecision === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verificationData = {
        approved: verificationDecision === 'approve',
        verifiedBy: currentUser.FullName,
        rejectionReason: verificationDecision === 'reject' ? rejectionReason : null
      };

      await onVerify(handsetData.id, verificationData);
      
      // Reset form
      setVerificationDecision('approve');
      setRejectionReason('');
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to verify probation');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setVerificationDecision('approve');
      setRejectionReason('');
      setError('');
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseModal}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <VerifiedUserIcon color="primary" />
          <Typography variant="h6">Probation Verification</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Verification Decision */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Probation Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please verify if this employee has completed their probation period.
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              value={verificationDecision}
              onChange={(e) => {
                setVerificationDecision(e.target.value);
                // Automatically set rejection reason when reject is selected
                if (e.target.value === 'reject') {
                  setRejectionReason('Probation Not Completed');
                } else {
                  setRejectionReason('');
                }
              }}
            >
              <FormControlLabel
                value="approve"
                control={<Radio color="success" />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography>Approve - Probation Completed</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="reject"
                control={<Radio color="error" />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CancelIcon color="error" fontSize="small" />
                    <Typography>Reject - Probation Not Completed</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Rejection Reason - Hidden, automatically set to "Probation Not Completed" */}
        {verificationDecision === 'reject' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Rejection Reason:</strong> "Probation Not Completed"
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
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color={verificationDecision === 'approve' ? 'success' : 'error'}
          startIcon={verificationDecision === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
        >
          {loading ? 'Processing...' : verificationDecision === 'approve' ? 'Approve Probation' : 'Reject Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProbationVerificationModal;
