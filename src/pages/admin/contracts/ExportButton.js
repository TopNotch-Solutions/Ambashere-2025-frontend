import React from 'react';
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTheme } from '@emotion/react';

// Assuming you have defined your colors somewhere accessible,
// or you can hardcode them here as we did in ContractFormModal.
// If you have a theme.js with tokens, you can import it.
// import { tokens } from './theme'; // Uncomment if you have tokens

const ExportButton = ({ data, fileName = 'exported_data' }) => {
  const theme = useTheme();
  // Define colors directly or re-import tokens if available
  const colors = {
    primary: { 400: '#1A202C', 500: '#2D3748' }, // Example dark mode colors
    grey: { 100: '#F7FAFC', 900: '#171923' },
    blueAccent: { 700: '#3182CE', 800: '#2B6CB0' },
    greenAccent: { 600: '#38A169', 700: '#2F855A' },
  };

  const handleExport = () => {
    if (!data || data.length === 0) {
      console.warn('No data to export.');
      return;
    }

    // --- Placeholder for actual export logic ---
    // You would typically convert 'data' (an array of objects) into a CSV string
    // or another format, and then trigger a download.
    // Example for CSV export (requires a utility function or library):
    // const csvContent = convertToCsv(data);
    // const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // const link = document.createElement('a');
    // if (link.download !== undefined) { // feature detection
    //   const url = URL.createObjectURL(blob);
    //   link.setAttribute('href', url);
    //   link.setAttribute('download', `${fileName}.csv`);
    //   link.style.visibility = 'hidden';
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // }

    console.log(`Exporting data to ${fileName}.csv`);
    console.log('Data to be exported:', data);
    alert(`Data export initiated for "${fileName}". Check console for details (actual download logic needs to be implemented).`);
  };

  return (
    <Button
      onClick={handleExport}
      sx={{
        backgroundColor: colors.blueAccent[700],
        color: colors.grey[100],
        '&:hover': { backgroundColor: colors.blueAccent[800] },
        padding: '10px 20px',
        borderRadius: '8px',
      }}
      startIcon={<FileDownloadIcon />}
    >
      Export
    </Button>
  );
};

export default ExportButton;