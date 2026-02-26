import { Box, IconButton, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Alert } from "@mui/material";
import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DevicesIcon from "@mui/icons-material/Devices";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import UploadDeviceList from "../../../components/admin/UploadDeviceList";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import { InputBase } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import HandsetAdminVoucher from "../../../components/global/HandsetAdminVoucher";
import AddHandsetModal from "../../../components/admin/AddHandsetModal";
import ProbationVerificationModal from "../../../components/admin/ProbationVerificationModal";
import formatDate from "../../../components/global/dateFormatter";
import Swal from "sweetalert2";

const AdminHandsets = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [selectedHandset, setSelectedHandset] = useState({});
  const [combinedData, setCombinedData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenDeviceList, setModalOpenDeviceList] = useState(false);
  const [addHandsetModalOpen, setAddHandsetModalOpen] = useState(false);
  const [probationModalOpen, setProbationModalOpen] = useState(false);
  const [selectedHandsetForProbation, setSelectedHandsetForProbation] = useState(null);
  const [mrNumberModalOpen, setMrNumberModalOpen] = useState(false);
  const [selectedHandsetForMR, setSelectedHandsetForMR] = useState(null);
  const [mrNumber, setMrNumber] = useState("");
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.user);
  const handleOpenDeviceList = () => setModalOpenDeviceList(true);
  const handleCloseDeviceList = () => setModalOpenDeviceList(false);
  const handleOpenAddHandset = () => setAddHandsetModalOpen(true);
  const handleCloseAddHandset = () => setAddHandsetModalOpen(false);
  const handleOpenProbationModal = (handsetData) => {
    console.log('Opening probation modal for handset:', handsetData);
    setSelectedHandsetForProbation(handsetData);
    setProbationModalOpen(true);
  };
  const handleCloseProbationModal = () => {
    setProbationModalOpen(false);
    setSelectedHandsetForProbation(null);
  };
  const handleOpenMRNumberModal = (handsetData) => {
    console.log('Opening MR Number modal for handset:', handsetData);
    setSelectedHandsetForMR(handsetData);
    setMrNumber(handsetData.MRNumber || "");
    setMrNumberModalOpen(true);
  };
  const handleCloseMRNumberModal = () => {
    setMrNumberModalOpen(false);
    setSelectedHandsetForMR(null);
    setMrNumber("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/handsets/staffHandsets`);
        setData(response.data);
      } catch (error) {
        // console.log(error);
        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

  const columns = [
    // Add actual DB ID for better referencing
    { field: "id", headerName: "#", width: 60 }, // This is still your row index
    { field: "EmployeeCode", headerName: "Employee Code", width: 130 },
    { field: "FixedAssetCode", headerName: "Fixed Asset Code", width: 150 },
    { field: "HandsetName", headerName: "Handset Name", width: 180 },
    { field: "DevicePrice", headerName: "Handset Price", width: 140 },
    { field: "ExccessPrice", headerName: "Excess Price", width: 140 },
    { field: "MRNumber", headerName: "MR Number", width: 120 }, // New column for MRNumber
    { 
      field: "RequestType", 
      headerName: "Request Type", 
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'New' ? 'primary' : 'secondary'}
          variant="filled"
          size="small"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}
        />
      )
    },
    { field: "RequestDate", headerName: "Requested Date", width: 180 },
    { field: "CollectionDate", headerName: "Collected Date", width: 180 }, // Renamed from AllocationDate for clarity
    { field: "RenewalDate", headerName: "Renewal Date", width: 180 }, // Renamed from NewAllocationDate for clarity
    { field: "Status", headerName: "Status", width: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      cellClassName: "actions",
      getActions: ({ row }) => {
        const actions = [];

        // Add probation verification action for New requests that are submitted
        console.log('Checking row for probation button:', { 
          RequestType: row.RequestType, 
          Status: row.Status, 
          shouldShow: row.RequestType === 'New' && row.Status === 'Submitted' 
        });
        
        if (row.RequestType === 'New' && row.Status === 'Submitted') {
          // Show only probation verification button for New submitted requests
          console.log('Adding probation verification button for row:', row);
          actions.push(
            <GridActionsCellItem
              icon={<VerifiedUserIcon />}
              label="Verify Probation"
              className="textPrimary"
              onClick={() => handleOpenProbationModal(row)}
              color="primary"
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }}
            />
          );
        } else if (row.FixedAssetCode && row.Status === 'Asset Code Assigned') {
          // Show MR creation button for handsets with Fixed Asset Code assigned
          console.log('Adding MR creation button for row:', row);
          actions.push(
            <GridActionsCellItem
              icon={<AssignmentIcon />}
              label="Create MR"
              className="textPrimary"
              onClick={() => handleOpenMRNumberModal(row)}
              color="secondary"
              sx={{
                '&:hover': {
                  backgroundColor: 'secondary.light',
                }
              }}
            />
          );
        } else {
          // Show edit button for all other cases
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={() => handleEditClick(row)}
              color="inherit"
            />
          );
        }

        return actions;
      },
    },
  ];

  const mapDataToRows = (data) => {
    return data.map((handset, index) => {
      const mappedRow = {
        id: handset.id, // This remains your sequential row number
        EmployeeCode: handset.EmployeeCode,
        HandsetName: handset.HandsetName,
        DevicePrice: handset.HandsetPrice,
        ExccessPrice: handset.AccessFeePaid,
        FixedAssetCode: handset.FixedAssetCode,
        MRNumber: handset.MRNumber, // *** ADDED MRNumber HERE ***
        RequestType: handset.RequestType || 'New', // Add RequestType field
        RequestDate: formatDate(handset.RequestDate),
        CollectionDate: formatDate(handset.CollectionDate), // *** Changed from AllocationDate and used CollectionDate directly ***
        RenewalDate: formatDate(handset.RenewalDate), // *** Changed from NewAllocationDate and used RenewalDate directly ***
        Status: handset.Status || handset.status,
      };
      
      // Debug logging for New requests
      if (mappedRow.RequestType === 'New') {
        console.log('Mapped New handset row:', {
          id: mappedRow.id,
          EmployeeCode: mappedRow.EmployeeCode,
          RequestType: mappedRow.RequestType,
          Status: mappedRow.Status,
          originalStatus: handset.Status || handset.status
        });
      }
      
      return mappedRow;
    });
  };
  const rows = mapDataToRows(data);

  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);

  const handleSearchChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearchText(searchText);

    const filteredData =
      searchText === ""
        ? data
        : data.filter(
            (handset) =>
              handset.FullName?.toLowerCase().includes(searchText) ||
              handset.HandsetName?.toLowerCase().includes(searchText) ||
              handset.RenewalDate?.toLowerCase().includes(searchText) ||
              handset.RequestType?.toLowerCase().includes(searchText) ||
              handset.EmployeeCode?.toLowerCase().includes(searchText)
          );

    setFilteredRows(mapDataToRows(filteredData));
  };

  useEffect(() => {
    setFilteredRows(mapDataToRows(data));
  }, [data]);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { probationModalOpen, selectedHandsetForProbation });
  }, [probationModalOpen, selectedHandsetForProbation]);

  const handleEditClick = async (data) => {
    console.log("active data: ", data);

    try {
      const response = await axiosInstance.get(
        `/staffmember/${data.EmployeeCode}`
      );
      console.log("Selected data: ", response.data);
      const employeeData = response.data; // Store the fetched employee data

      console.log("Fetched employee data for voucher: ", employeeData);

      // Directly use the fetched employeeData and the passed handsetRowData
      // instead of relying on the async state updates of selectedEmployee and selectedHandset
      setCombinedData({
        employee: employeeData,
        handset: data,
      });
      handleOpenEdit();
    } catch (error) {
      // console.log(error);
      throw error;
    }

    // setCurrentPackage(packages);
    // setModalMode("edit");
    // setModalOpen(true);
  };

  const handleRemoveClick = (data) => {
    // setCurrentPackage(packages);
    // setModalMode("remove");
    // setModalOpen(true);
  };

  const handleVerifyProbation = async (handsetId, verificationData) => {
    try {
      const response = await axiosInstance.post(`/handsets/verify-probation/${handsetId}`, verificationData);
      
      if (response.data.success) {
        const { approved, rejectionReason } = verificationData;
        const message = approved 
          ? `Probation verification successful!\n\nStatus updated to: ${response.data.handset?.Status || 'Probation Verified'}`
          : `Handset request rejected!\n\nReason: ${rejectionReason || 'Your probation is not yet completed.'}`;
        
        // Refresh the data
        const fetchData = async () => {
          try {
            const response = await axiosInstance.get(`/handsets/staffHandsets`);
            setData(response.data);
          } catch (error) {
            console.log(error);
            throw error;
          }
        };
        fetchData();
      } else {
        alert('❌ Failed to verify probation: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error verifying probation:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to verify probation');
    }
  };

  const handleAssignMRNumber = async () => {
    if (!selectedHandsetForMR || !mrNumber.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter MR Number'
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/handsets/assign-mr-number/${selectedHandsetForMR.id}`, {
        mrNumber: mrNumber.trim(),
        assignedBy: currentUser.FullName
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'MR Created!',
          text: `MR Number ${mrNumber} has been created successfully. Subledger: ${selectedHandsetForMR.EmployeeCode}`
        });
        
        handleCloseMRNumberModal();
        
        // Refresh the data
        const fetchData = async () => {
          try {
            const response = await axiosInstance.get(`/handsets/staffHandsets`);
            setData(response.data);
          } catch (error) {
            console.log(error);
            throw error;
          }
        };
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning MR Number:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to assign MR Number'
      });
    }
  };

  const handleOpenEdit = async () => {
    try {
      const response = await axiosInstance.get(
        `/staffmember/allocation/handset/${currentUser.EmployeeCode}`
      );
      console.log("Response data handset admin:", response.data); // Log the response to inspect its structure
      if (
        Array.isArray(response?.data?.staffWithAirtimeAllocation) &&
        response?.data?.staffWithAirtimeAllocation?.length > 0
      ) {
        setUserData(response.data[0]); // Assuming you want the first element in the array
        setModalOpen(true);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const handleClose = () => {
    setModalOpen(false);
    setCombinedData(null); // Clear combinedData when modal closes to prevent stale data
  };

  const handleAddHandsetSuccess = () => {
    // Refresh the data when a new handset is added
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/handsets/staffHandsets`);
        setData(response.data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    };
    fetchData();
  };
  return (
    <Box m="2px">
      <div
        style={{
          height: 500,
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            className="d-flex col-md-5"
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
            width="200px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search"
              onChange={handleSearchChange}
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
          {currentUser.RoleID === 1 ? (
            <div className="d-flex col-md-6 justify-content-between">
              <Button
                style={{
                  gap: "10px",
                  height: "100%",
                  backgroundColor: "#1674BB",
                  color: "#fff",
                  padding: "8px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  borderColor: "#1A69AC",
                  border: "1px solid",
                }}
                onClick={handleOpenAddHandset}
              >
                Add Handset Record
                <DevicesIcon size={16} />
              </Button>
              <Button
                style={{
                  gap: "10px",
                  height: "100%",
                  backgroundColor: "#0096D6",
                  color: "#fff",
                  padding: "8px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  borderColor: "#1A69AC",
                  border: "1px solid",
                }}
                onClick={handleOpenDeviceList}
              >
                Upload Price List
                <UploadFileIcon size={16} />
              </Button>
              <ExportButton data={rows} fileName="Handsets" />
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <HandsetAdminVoucher
          style={{ height: "100%" }}
          open={modalOpen}
          handleClose={handleClose}
          userData={combinedData}
          role={role}
        />
        <AddHandsetModal
          open={addHandsetModalOpen}
          handleClose={handleCloseAddHandset}
          onSuccess={handleAddHandsetSuccess}
        />
        <ProbationVerificationModal
          open={probationModalOpen}
          handleClose={handleCloseProbationModal}
          handsetData={selectedHandsetForProbation}
          onVerify={handleVerifyProbation}
        />
        
        {/* MR Number Assignment Modal */}
        <Dialog open={mrNumberModalOpen} onClose={handleCloseMRNumberModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon color="secondary" />
              <Typography variant="h6">Create MR</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedHandsetForMR && (
              <Box mb={2}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Employee:</strong> {selectedHandsetForMR.EmployeeCode}<br/>
                    <strong>Device:</strong> {selectedHandsetForMR.HandsetName}<br/>
                    <strong>Fixed Asset Code:</strong> {selectedHandsetForMR.FixedAssetCode}
                  </Typography>
                </Alert>
                
                <TextField
                  autoFocus
                  margin="dense"
                  label="MR Number"
                  fullWidth
                  variant="outlined"
                  value={mrNumber}
                  onChange={(e) => setMrNumber(e.target.value)}
                  placeholder="Enter MR Number"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="dense"
                  label="Subledger Number (Employee Code)"
                  fullWidth
                  variant="outlined"
                  value={selectedHandsetForMR.EmployeeCode}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Subledger number is automatically set to Employee Code"
                  sx={{
                    "& .MuiInputBase-input": {
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMRNumberModal} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignMRNumber} 
              color="secondary" 
              variant="contained"
              disabled={!mrNumber.trim()}
            >
              Create MR
            </Button>
          </DialogActions>
        </Dialog>
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
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            key={filteredRows.length} // Force re-render when data changes
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Box>

        {modalOpenDeviceList && (
          <div className="modal">
            <div className="modal-content">
              <UploadDeviceList
                style={{ height: "100%" }}
                open={modalOpenDeviceList}
                handleClose={handleCloseDeviceList}
              />
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default AdminHandsets;
