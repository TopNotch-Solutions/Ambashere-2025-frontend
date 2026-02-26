import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import { useTheme } from '@emotion/react';
import logo from '../../assets/Img/image 1.png';

// Add print styles
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

const StaffHandsetFormVoucher = ({ voucherData, isPrintMode = false }) => {
  const theme = useTheme();

  if (!voucherData) {
    return <Typography>No voucher data available</Typography>;
  }

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "210mm", // A4 width
        margin: "0 auto",
        overflow: "hidden",
        boxShadow: isPrintMode ? "none" : 6,
        p: 3,
        minHeight: "297mm", // A4 height
        "@media print": {
          boxShadow: "none",
          borderRadius: 0,
          margin: 0,
          padding: "10mm",
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "297mm",
          pageBreakAfter: "avoid",
          pageBreakInside: "avoid"
        }
      }}
    >
      {/* Header Branding */}
      <Box
        sx={{
          background: "linear-gradient(90deg, #0096D6, #0078A8)",
          borderRadius: "8px",
          p: 2,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          "@media print": {
            padding: "8mm",
            borderRadius: "4px",
            "-webkit-print-color-adjust": "exact",
            "print-color-adjust": "exact",
            marginBottom: "4mm"
          },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5, fontSize: "1.5rem" }}>
            Staff Handset Form
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, fontSize: "1rem" }}>
            Control Card - {voucherData.controlCardNumber}
          </Typography>
        </Box>
        <img
          src={logo}
          alt="MTC Logo"
          height="40"
          style={{ objectFit: "contain" }}
        />
      </Box>


      {/* Form Content - Professional Layout */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", lg: "row" },
        gap: 4,
        "@media print": { 
          flexDirection: "row",
          gap: "8mm"
        }
      }}>
        {/* Left Column - Employee & Request Info */}
        <Box sx={{ 
          flex: "1 1 50%", 
          minWidth: 0,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 2,
          "@media print": {
            border: "1px solid #000",
            borderRadius: 0,
            padding: "3mm"
          }
        }}>
          {/* Request Information */}
          <Box sx={{ mb: 3, "@media print": { marginBottom: "4mm" } }}>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              color: "#000000", 
              fontWeight: "bold", 
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              borderBottom: "1px solid #000000", 
              pb: 0.5,
              mb: 1.5
            }}>
              Request Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Request Number"
                    value={voucherData.requestNumber}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Request Type"
                    value={voucherData.requestType}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
              </Box>
              <TextField
                fullWidth
                label="Request Date"
                value={new Date(voucherData.requestDate).toLocaleDateString('en-GB')}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
            </Box>
          </Box>

          {/* Employee Information */}
          <Box sx={{ mb: 2, "@media print": { marginBottom: "4mm" } }}>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              color: "#000000", 
              fontWeight: "bold", 
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              borderBottom: "1px solid #000000", 
              pb: 0.5,
              mb: 1.5
            }}>
              Employee Details
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Employee Name"
                value={voucherData.employeeName}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
              <Box display="flex" gap={2}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Employee Code"
                    value={voucherData.employeeCode}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={voucherData.department}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
              </Box>
              <TextField
                fullWidth
                label="Position"
                value={voucherData.position}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right Column - Device & Asset Info */}
        <Box sx={{ 
          flex: "1 1 50%", 
          minWidth: 0,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 2,
          "@media print": {
            border: "1px solid #000",
            borderRadius: 0,
            padding: "3mm"
          }
        }}>
          {/* Device Information */}
          <Box sx={{ mb: 3, "@media print": { marginBottom: "4mm" } }}>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              color: "#000000", 
              fontWeight: "bold", 
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              borderBottom: "1px solid #000000", 
              pb: 0.5,
              mb: 1.5
            }}>
              Device Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Handset Name"
                value={voucherData.handsetName}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
              <Box display="flex" gap={2}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Device Price"
                    value={`N$${voucherData.handsetPrice}`}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Access Fee Paid"
                    value={`N$${voucherData.accessFeePaid}`}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
              </Box>
              {voucherData.excessAmount > 0 && (
                <TextField
                  fullWidth
                  label="Excess Amount"
                  value={`N$${voucherData.excessAmount}`}
                  InputProps={{ readOnly: true }}
                  size="small"
                  variant="outlined"
                  color="warning"
                  sx={{ 
                    "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                    "& .MuiOutlinedInput-root": { backgroundColor: "#fff3e0" }
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Asset Information */}
          <Box sx={{ mb: 2, "@media print": { marginBottom: "4mm" } }}>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              color: "#000000", 
              fontWeight: "bold", 
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              borderBottom: "1px solid #000000", 
              pb: 0.5,
              mb: 1.5
            }}>
              Asset Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Fixed Asset Code"
                value={voucherData.fixedAssetCode || "Not Assigned"}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem", fontWeight: "bold" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
              <Box display="flex" gap={2}>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="MR Number"
                    value={voucherData.mrNumber || "Not Created"}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 50%" }}>
                  <TextField
                    fullWidth
                    label="Subledger Number"
                    value={voucherData.subledgerNumber}
                    InputProps={{ readOnly: true }}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      "& .MuiInputBase-input": { fontSize: "0.9rem" },
                      "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>


      {/* MR Information - Full Width */}
      {voucherData.mrCreatedDate && (
        <Box sx={{ 
          mb: 3, 
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 2,
          "@media print": { 
            marginBottom: "5mm",
            border: "1px solid #000",
            borderRadius: 0,
            padding: "3mm"
          }
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            color: "#1976d2", 
            fontWeight: "bold", 
            fontSize: "1.1rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            borderBottom: "2px solid #1976d2", 
            pb: 1,
            mb: 2
          }}>
            MR Information
          </Typography>
          <Box display="flex" gap={2}>
            <Box sx={{ flex: "1 1 50%" }}>
              <TextField
                fullWidth
                label="MR Created Date"
                value={new Date(voucherData.mrCreatedDate).toLocaleDateString('en-GB')}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
            </Box>
            <Box sx={{ flex: "1 1 50%" }}>
              <TextField
                fullWidth
                label="MR Created By"
                value={voucherData.mrCreatedBy}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
                sx={{ 
                  "& .MuiInputBase-input": { fontSize: "0.9rem" },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#f5f5f5" }
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Signature Section */}
      <Box sx={{ 
        mt: 4, 
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        p: 2,
        "@media print": { 
          marginTop: "6mm",
          border: "1px solid #000",
          borderRadius: 0,
          padding: "3mm"
        }
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: "#1976d2", 
          fontWeight: "bold", 
          fontSize: "1.1rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          borderBottom: "2px solid #1976d2", 
          pb: 1,
          mb: 3
        }}>
          Authorization & Signatures
        </Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
            <Typography variant="body1" sx={{ 
              mb: 2, 
              fontSize: "0.9rem", 
              fontWeight: "bold",
              color: "#333"
            }}>
              Employee Signature
            </Typography>
            <Box
              sx={{
                height: "60px",
                border: "2px solid #ccc",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fafafa",
                "@media print": {
                  height: "20mm",
                  border: "2px solid #000",
                  backgroundColor: "#fff"
                }
              }}
            >
              <Typography variant="body2" sx={{ 
                color: "#666", 
                fontSize: "0.8rem",
                fontStyle: "italic"
              }}>
                Employee Signature Required
              </Typography>
            </Box>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#666" }}>
                Date: _______________
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#666" }}>
                Print Name: {voucherData.employeeName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
            <Typography variant="body1" sx={{ 
              mb: 2, 
              fontSize: "0.9rem", 
              fontWeight: "bold",
              color: "#333"
            }}>
              Retail Supervisor Signature
            </Typography>
            <Box
              sx={{
                height: "60px",
                border: "2px solid #ccc",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fafafa",
                "@media print": {
                  height: "20mm",
                  border: "2px solid #000",
                  backgroundColor: "#fff"
                }
              }}
            >
              <Typography variant="body2" sx={{ 
                color: "#666", 
                fontSize: "0.8rem",
                fontStyle: "italic"
              }}>
                Retail Supervisor Signature Required
              </Typography>
            </Box>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#666" }}>
                Date: _______________
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#666" }}>
                Print Name: _______________
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer Information */}
      <Box sx={{ 
        mt: 2, 
        textAlign: "center", 
        color: "text.secondary",
        "@media print": { marginTop: "5mm" }
      }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          Printed on: {voucherData.printedDateFormatted} at {voucherData.printedTimeFormatted}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          Printed by: {voucherData.printedBy}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: "bold", fontSize: "0.75rem" }}>
          Control Card Number: {voucherData.controlCardNumber}
        </Typography>
      </Box>
    </Box>
  );
};

export default StaffHandsetFormVoucher;
