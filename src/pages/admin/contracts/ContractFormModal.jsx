import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useTheme } from '@emotion/react';
import axiosInstance from '../../../utils/axiosInstance';

// Helper to convert backend field names (e.g., "Full Names") to camelCase (e.g., "fullNames")
const toCamelCase = (str) => {
  if (!str) return '';
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

// Helper to convert camelCase to Title Case for labels
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/([A-Z])/g, ' $1')
             .replace(/^./, (str) => str.toUpperCase())
             .trim();
};

const ContractFormModal = ({ open, handleClose, contractData = null, onSave }) => {
  const theme = useTheme();
   const [packages, setPackages] = useState([]); 
  // Define colors directly or re-import tokens if available
  const colors = {
    // Custom grey shades for backgrounds, matching ContractManagementPage
    backgroundLightGrey: '#F5F5F5', // Very light grey for main table body and search input background
    backgroundMediumGrey: '#E0E0E0', // Slightly darker grey for table headers and footer
    
    // Existing colors, adjusted for better contrast on lighter backgrounds if needed
    primary: { 400: '#1A202C', 500: '#2D3748' }, // Original dark primary colors (not used for backgrounds here)
    grey: { 100: '#333333', 900: '#171923' }, // Adjusted grey[100] for text on light backgrounds, grey[900] for other elements
    blueAccent: { 700: '#3182CE', 800: '#2B6CB0' },
    greenAccent: { 600: '#38A169', 700: '#2F855A' },
  };

  // Initialize form state with existing contract data or empty fields for new contract
  const [formData, setFormData] = useState(() => {
    if (contractData) {
      // Map existing contract data to form fields, converting keys to camelCase
      const initialData = {};
      for (const key in contractData) {
        if (Object.prototype.hasOwnProperty.call(contractData, key)) {
          initialData[toCamelCase(key)] = contractData[key];
        }
      }
      console.log(contractData)
      return initialData;
    }
    return {
      employeeCode: '',
      "active/Inactive": 'Active', // Default for new contracts
      surname: '',
      fullNames: '',
     "joinedName&Surname": '',
      position: '',
      totalAirtimeAllowance: '',
      oldNetmanBenefit: '',
      newNetmanSelectTotal: '',
      phoneSubscriptionValue: '',
      mulBalance: '',
      check30Percent: '',
      prePost: '',
      cellNumber: '',
      contract1: '',
      optionMsisdn1: '',
      contract2: '',
      optionMsisdn2: '',
      contract3: '',
      optionMsisdn3: '',
      contract4: '',
      optionMsisdn4: '',
      contract5: '',
      optionMsisdn5: '',
      contract6: '',
      optionMsisdn6: '',
      contractOption1Sub: '',
      contractOption2Sub: '',
      contractOption3Sub: '',
      contractOption4Sub: '',
      contractOption5Sub: '',
      contractOption6Sub: '',
      equipmentPlan1: '',
      equipmentPlan2: '',
      equipmentPlan3: '',
      equipmentPlan4: '',
      equipmentPlan5: '',
      equipmentPlan6: '',
      equipmentPrice1: '',
      equipmentPrice2: '',
      equipmentPrice3: '',
      equipmentPrice4: '',
      equipmentPrice5: '',
      equipmentPrice6: '',
    };
  });

  // Update form data when contractData prop changes (e.g., when editing a different contract)
  useEffect(() => {
    if (contractData) {
      const initialData = {};
      for (const key in contractData) {
        if (Object.prototype.hasOwnProperty.call(contractData, key)) {
          initialData[toCamelCase(key)] = contractData[key];
        }
        console.log("Initial data: ", initialData)
      }
      console.log(initialData);
      setFormData(initialData);
    } else {
      // Reset form for new contract if contractData is null
      setFormData({
        employeeCode: '',
        "active/Inactive": 'Active',
        surname: '',
        fullNames: '',
        "joinedName&Surname": '',
        position: '',
        totalAirtimeAllowance: '',
        oldNetmanBenefit: '',
        newNetmanSelectTotal: '',
        phoneSubscriptionValue: '',
        mulBalance: '',
        check30Percent: '',
        prePost: '',
        cellNumber: '',
        contract1: '',
        optionMsisdn1: '',
        contract2: '',
        optionMsisdn2: '',
        contract3: '',
        optionMsisdn3: '',
        contract4: '',
        optionMsisdn4: '',
        contract5: '',
        optionMsisdn5: '',
        contract6: '',
        optionMsisdn6: '',
        contractOption1Sub: '',
        contractOption2Sub: '',
        contractOption3Sub: '',
        contractOption4Sub: '',
        contractOption5Sub: '',
        contractOption6Sub: '',
        equipmentPlan1: '',
        equipmentPlan2: '',
        equipmentPlan3: '',
        equipmentPlan4: '',
        equipmentPlan5: '',
        equipmentPlan6: '',
        equipmentPrice1: '',
        equipmentPrice2: '',
        equipmentPrice3: '',
        equipmentPrice4: '',
        equipmentPrice5: '',
        equipmentPrice6: '',
      });
    }
  }, [contractData]);
useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Assuming an API endpoint for fetching all packages
         const response = await axiosInstance.get(`/packages`); // Adjust this endpoint as needed
        setPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Handle error, e.g., show a user-friendly message
      }
    };

    if (open) {
      fetchPackages();
    }
  }, [open]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Before submitting, convert camelCase keys back to original field names for the backend
    const dataToSend = {};
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        // This is a simplified conversion. For exact mapping, you might need a lookup table.
        // For now, assuming camelCase to "Title Case" or "Space Separated" works for most.
        let backendKey = toTitleCase(key);
        // Handle specific cases that don't convert cleanly (e.g., "employeeCode" to "Employee Code")
        if (key === 'employeeCode') backendKey = 'Employee Code';
        else if (key === 'active/Inactive') backendKey = 'Active/Inactive';
        else if (key === 'joinedName&Surname') backendKey = 'Joined Name & Surname';
        else if (key === 'totalAirtimeAllowance') backendKey = 'Total Airtime Allowance';
        else if (key === 'oldNetmanBenefit') backendKey = 'Old Netman Benefit';
        else if (key === 'newNetmanSelectTotal') backendKey = 'New Netman/Select total';
        else if (key === 'phoneSubscriptionValue') backendKey = 'Phone Subscription Value (after upfront payment, if any)';
        else if (key === 'mulBalance') backendKey = 'MUL Balance';
        else if (key === 'check30Percent') backendKey = '30% Check';
        else if (key === 'prePost') backendKey = 'Pre/Post';
        else if (key === 'cellNumber') backendKey = 'Cell number';
        else if (key.startsWith('optionMsisdn')) backendKey = `Option MSISDN ${key.slice(-1)}`; // e.g., optionMsisdn1 -> Option MSISDN 1
        else if (key.startsWith('contractOption') && key.endsWith('Sub')) backendKey = `Contract option ${key.slice(14, -3)} sub`; // e.g., contractOption1Sub -> Contract option 1 sub
        else if (key.startsWith('equipmentPlan')) backendKey = `Equipment Plan ${key.slice(-1)}`;
        else if (key.startsWith('equipmentPrice')) backendKey = `Equipment Price ${key.slice(-1)}`;


        dataToSend[backendKey] = formData[key];
      }
    }

    // Include the original ID if it's an edit operation
    if (contractData && contractData.id) {
      dataToSend.id = contractData.id; // Use the actual database ID for updates
    } else if (contractData && contractData.ContractNumber) {
      // If the UI uses ContractNumber as its 'id' for display, ensure it's passed for update lookup
      dataToSend.ContractNumber = contractData.ContractNumber;
    }

    onSave(dataToSend);
  };

  const formFields = [
    { name: 'employeeCode', label: 'Employee Code', type: 'text' },
    { name: 'active/Inactive', label: 'Active/Inactive', type: 'select', options: ['Active', 'Inactive'] },
    { name: 'surname', label: 'Surname', type: 'text' },
    { name: 'fullNames', label: 'Full Names', type: 'text' },
    { name: 'joinedName&Surname', label: 'Joined Name & Surname', type: 'text' },
    { name: 'position', label: 'Position', type: 'text' },
    { name: 'totalAirtimeAllowance', label: 'Total Airtime Allowance', type: 'select', options: ['2200.00', '3300.00','4400.00','8000.00', ]  },
    { name: 'oldNetmanBenefit', label: 'Old Netman Benefit', type: 'number' },
    { name: 'newNetman/SelectTotal', label: 'New Netman/Select Total', type: 'number' },
    { name: 'phoneSubscriptionValue(AfterUpfrontPayment,IfAny)', label: 'Phone Subscription Value', type: 'number' },
    { name: 'mULBalance', label: 'MUL Balance', type: 'number' },
    { name: '30%Check', label: '30% Check', type: 'select' ,options: ['Within limit', 'Exceeding', ]},
    { name: 'pre/Post', label: 'Pre/Post', type: 'select' ,options: ['PrePaid', 'PostPaid', ] },
    { name: 'cellNumber', label: 'Cell Number', type: 'text' },
    { name: 'contract1', label: 'Contract 1', type: 'select',
      options: packages.map(pkg => pkg.PackageName), },
    { name: 'optionMSISDN1', label: 'Option MSISDN 1', type: 'text' },
    { name: 'contract2', label: 'Contract 2', type: 'select',
      options: packages.map(pkg => pkg.PackageName),},
    { name: 'optionMSISDN2', label: 'Option MSISDN 2', type: 'text' },
    { name: 'contract3', label: 'Contract 3', type: 'select',
      options: packages.map(pkg => pkg.PackageName),},
    { name: 'optionMSISDN3', label: 'Option MSISDN 3', type: 'text' },
    { name: 'contract4', label: 'Contract 4', type: 'select',
      options: packages.map(pkg => pkg.PackageName), },
    { name: 'optionMSISDN4', label: 'Option MSISDN 4', type: 'text' },
    { name: 'contract5', label: 'Contract 5', type: 'select',
      options: packages.map(pkg => pkg.PackageName), },
    { name: 'optionMSISDN5', label: 'Option MSISDN 5', type: 'text' },
    { name: 'contract6', label: 'Contract 6', type: 'select',
      options: packages.map(pkg => pkg.PackageName),},
    { name: 'optionMSISDN6', label: 'Option MSISDN 6', type: 'text' },
    { name: 'contractOption1Sub', label: 'Contract Option 1 Sub', type: 'text' },
    { name: 'contractOption2Sub', label: 'Contract Option 2 Sub', type: 'text' },
    { name: 'contractOption3Sub', label: 'Contract Option 3 Sub', type: 'text' },
    { name: 'contractOption4Sub', label: 'Contract Option 4 Sub', type: 'text' },
    { name: 'contractOption5Sub', label: 'Contract Option 5 Sub', type: 'text' },
    { name: 'contractOption6Sub', label: 'Contract Option 6 Sub', type: 'text' },
    { name: 'equipmentPlan1', label: 'Equipment Plan 1', type: 'text' },
    { name: 'equipmentPlan2', label: 'Equipment Plan 2', type: 'text' },
    { name: 'equipmentPlan3', label: 'Equipment Plan 3', type: 'text' },
    { name: 'equipmentPlan4', label: 'Equipment Plan 4', type: 'text' },
    { name: 'equipmentPlan5', label: 'Equipment Plan 5', type: 'text' },
    { name: 'equipmentPlan6', label: 'Equipment Plan 6', type: 'text' },
    { name: 'equipmentPrice1', label: 'Equipment Price 1', type: 'text' }, // Keep as text for now due to mixed types
    { name: 'equipmentPrice2', label: 'Equipment Price 2', type: 'text' },
    { name: 'equipmentPrice3', label: 'Equipment Price 3', type: 'text' },
    { name: 'equipmentPrice4', label: 'Equipment Price 4', type: 'text' },
    { name: 'equipmentPrice5', label: 'Equipment Price 5', type: 'text' },
    { name: 'equipmentPrice6', label: 'Equipment Price 6', type: 'text' },
  ];


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ backgroundColor: colors.backgroundMediumGrey, color: colors.grey[100] }}>
        {contractData ? 'Edit Contract' : 'Add New Contract'}
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: colors.backgroundLightGrey }}>
        <Box
          component="form"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            padding: '16px',
          }}
          noValidate
          autoComplete="off"
        >
          {formFields.map((field) => (
            field.type === 'select' ? (
              <FormControl key={field.name} fullWidth margin="normal" variant="filled">
                <InputLabel sx={{ color: colors.grey[100] }}>{field.label}</InputLabel> {/* Label color */}
                <Select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  sx={{
                    backgroundColor: colors.backgroundMediumGrey, // Input background
                    borderRadius: '4px',
                    '& .MuiInputBase-input': { // Text color inside select
                      color: colors.grey[100],
                    },
                    '& .MuiSelect-icon': { // Icon color
                      color: colors.grey[100],
                    },
                  }}
                >
                  {field.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                type={field.type}
                fullWidth
                margin="normal"
                variant="filled"
                sx={{
                  '& .MuiFilledInput-root': {
                    backgroundColor: colors.backgroundMediumGrey, // Input background
                    borderRadius: '4px',
                  },
                  '& .MuiInputLabel-root': {
                    color: colors.grey[100], // Label color
                  },
                  '& .MuiFilledInput-input': {
                    color: colors.grey[100], // Text color inside input
                  },
                }}
              />
            )
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: colors.backgroundMediumGrey, padding: '16px' }}>
        <Button
          onClick={handleClose}
          sx={{
            color: colors.grey[100],
            backgroundColor: colors.blueAccent[700],
            '&:hover': { backgroundColor: colors.blueAccent[800] },
            padding: '8px 20px',
            borderRadius: '8px',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            color: colors.grey[100],
            backgroundColor: colors.greenAccent[600],
            '&:hover': { backgroundColor: colors.greenAccent[700] },
            padding: '8px 20px',
            borderRadius: '8px',
          }}
        >
          {contractData ? 'Update Contract' : 'Add Contract'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractFormModal;
