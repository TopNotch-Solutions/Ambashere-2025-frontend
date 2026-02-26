// import React, { useEffect, useState } from 'react';
// import { Box, Button, IconButton, Typography, CircularProgress, Alert } from '@mui/material';
// import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import AddIcon from '@mui/icons-material/Add';
// import SearchIcon from '@mui/icons-material/Search';
// import InputBase from '@mui/material/InputBase';
// import { useTheme } from '@emotion/react';
// import axiosInstance from "../../../utils/axiosInstance";
// // import { tokens } from './theme'; // Assuming you still have a theme.js or similar for colors
// // Assuming axiosInstance is configured
// import ContractFormModal from './ContractFormModal'; // The modal component we just created
// import ExportButton from './ExportButton'; // Assuming you have this component

// // Helper function to format dates (re-using from your AdminContracts example)
// const formatDate = (dateString) => {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
// };

// const ContractManagementPage = () => {
//   const theme = useTheme();
//   // Define colors directly or re-import tokens if available
//   const colors = {
//     // Custom grey shades for backgrounds
//     backgroundLightGrey: '#F5F5F5', // Very light grey for main table body and search input background
//     backgroundMediumGrey: '#E0E0E0', // Slightly darker grey for table headers and footer
    
//     // Existing colors, adjusted for better contrast on lighter backgrounds if needed
//     primary: { 400: '#1A202C', 500: '#2D3748' }, // Original dark primary colors (not used for backgrounds here)
//     grey: { 100: '#333333', 900: '#171923' }, // Adjusted grey[100] for text on light backgrounds, grey[900] for other elements
//     blueAccent: { 700: '#3182CE', 800: '#2B6CB0' },
//     greenAccent: { 600: '#38A169', 700: '#2F855A' },
//   };


//   const [contracts, setContracts] = useState([]);
  
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedContract, setSelectedContract] = useState(null); // For editing
//   const [searchText, setSearchText] = useState('');
//   const [filteredContracts, setFilteredContracts] = useState([]);

//   // Function to fetch all contracts
//   const fetchContracts = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Assuming your backend endpoint for all contracts is /contracts/all
//       const response = await axiosInstance.get('/contracts/existing-data');
//       console.log(response.data[0])
//       setContracts(response.data);
//       // Initialize filtered contracts with all data after fetching
//       setFilteredContracts(response.data);
//     } catch (err) {
//       console.error('Error fetching contracts:', err);
//       setError('Failed to load contracts. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // This useEffect fetches data on component mount
//   useEffect(() => {
//     fetchContracts();
//   }, []); // Empty dependency array means it runs once on mount

  
//   // Effect for filtering contracts based on search text
//   useEffect(() => {
//     const lowercasedSearchText = searchText.toLowerCase();
//     const filteredData = contracts.filter((contract) => {
//       // Search across multiple relevant fields
//       return (
//         (contract['Full Names'] && contract['Full Names'].toLowerCase().includes(lowercasedSearchText)) ||
//         (contract.Position && contract.Position.toLowerCase().includes(lowercasedSearchText)) ||
//         (contract['Cell number'] && contract['Cell number'].toLowerCase().includes(lowercasedSearchText)) ||
//         (contract['Employee Code'] && contract['Employee Code'].toLowerCase().includes(lowercasedSearchText)) ||
//         (contract.Surname && contract.Surname.toLowerCase().includes(lowercasedSearchText)) ||
//         (contract['Total Airtime Allowance'] && contract['Total Airtime Allowance'].toLowerCase().includes(lowercasedSearchText)) ||
//         (contract['Joined Name & Surname'] && contract['Joined Name & Surname'].toLowerCase().includes(lowercasedSearchText))
//       );
//     });
//     setFilteredContracts(filteredData);
//   }, [searchText, contracts]); // Re-run when searchText or contracts change

//   // Handle opening modal for adding a new contract
//   const handleAddClick = () => {
//     setSelectedContract(null); // No contract selected for adding
//     setModalOpen(true);
//   };

//   // Handle opening modal for editing an existing contract
//   const handleEditClick = (contract) => {
//     setSelectedContract(contract); // Set the contract to be edited
//     setModalOpen(true);
//   };

//   // Handle saving (add/update) a contract
//   const handleSaveContract = async (contractDataToSave) => {
//     try {
//       if (selectedContract) {
//         // Update existing contract
//         // Use the actual database 'id' for the update operation if available,
//         // otherwise fall back to 'ContractNumber' if that's the lookup key.
//         const idToUse = selectedContract.id || selectedContract.ContractNumber;
//         console.log(contractDataToSave)
//         await axiosInstance.put(`/contracts/existing-data/${idToUse}`, contractDataToSave);
//       } else {
//         // Add new contract
//         await axiosInstance.post('/contracts/existing-data', contractDataToSave);
//       }
//       setModalOpen(false);
//       setSelectedContract(null); // Clear selected contract
//       fetchContracts(); // Refresh the list
//     } catch (err) {
//       console.error('Error saving contract:', err);
//       setError('Failed to save contract. Please check your input.');
//     }
//   };

//   // Handle deleting a contract
//   const handleDeleteClick = async (id) => {
//     if (window.confirm('Are you sure you want to delete this contract?')) { // Using window.confirm for simplicity, replace with custom modal
//       try {
//         await axiosInstance.delete(`/contracts/delete/${id}`);
//         fetchContracts(); // Refresh the list
//       } catch (err) {
//         console.error('Error deleting contract:', err);
//         setError('Failed to delete contract. Please try again.');
//       }
//     }
//   };

//   // DataGrid columns definition
//   const columns = [
//     { field: 'id', headerName: 'ID', width: 80, valueGetter: (params) => params.row.id || params.row.ContractNumber },
//     { field: 'Employee Code', headerName: 'Employee Code', width: 150 },
//     { field: 'Active/Inactive', headerName: 'Status', width: 120 },
//     { field: 'Surname', headerName: 'Surname', width: 150 },
//     { field: 'Full Names', headerName: 'Full Name', width: 200 },
//     { field: 'Joined Name & Surname', headerName: 'Joined Name & Surname', width: 220 },
//     { field: 'Position', headerName: 'Position', width: 180 },
//     { field: 'Total Airtime Allowance', headerName: 'Total Airtime Allowance', width: 180, type: 'number' },
//     { field: 'Old Netman Benefit', headerName: 'Old Netman Benefit', width: 150, type: 'number' },
//     { field: 'New Netman/Select total', headerName: 'New Netman/Select Total', width: 200, type: 'number' },
//     { field: 'Phone Subscription Value (after upfront payment, if any)', headerName: 'Phone Subscription Value', width: 250, type: 'number' },
//     { field: 'MUL Balance', headerName: 'MUL Balance', width: 120, type: 'number' },
//     { field: '30% Check', headerName: '30% Check', width: 120 },
//     { field: 'Pre/Post', headerName: 'Pre/Post', width: 100 },
//     { field: 'Cell number', headerName: 'Cell Number', width: 150 },
//     { field: 'Contract 1', headerName: 'Contract 1', width: 150 },
//     { field: 'Option MSISDN 1', headerName: 'Option MSISDN 1', width: 150 },
//     { field: 'Contract 2', headerName: 'Contract 2', width: 150 },
//     { field: 'Option MSISDN 2', headerName: 'Option MSISDN 2', width: 150 },
//     { field: 'Contract 3', headerName: 'Contract 3', width: 150 },
//     { field: 'Option MSISDN 3', headerName: 'Option MSISDN 3', width: 150 },
//     { field: 'Contract 4', headerName: 'Contract 4', width: 150 },
//     { field: 'Option MSISDN 4', headerName: 'Option MSISDN 4', width: 150 },
//     { field: 'Contract 5', headerName: 'Contract 5', width: 150 },
//     { field: 'Option MSISDN 5', headerName: 'Option MSISDN 5', width: 150 },
//     { field: 'Contract 6', headerName: 'Contract 6', width: 150 },
//     { field: 'Option MSISDN 6', headerName: 'Option MSISDN 6', width: 150 },
//     { field: 'Contract option 1 sub', headerName: 'Contract Option 1 Sub', width: 200 },
//     { field: 'Contract option 2 sub', headerName: 'Contract Option 2 Sub', width: 200 },
//     { field: 'Contract option 3 sub', headerName: 'Contract Option 3 Sub', width: 200 },
//     { field: 'Contract option 4 sub', headerName: 'Contract Option 4 Sub', width: 200 },
//     { field: 'Contract option 5 sub', headerName: 'Contract Option 5 Sub', width: 200 },
//     { field: 'Contract option 6 sub', headerName: 'Contract Option 6 Sub', width: 200 },
//     { field: 'Equipment Plan 1', headerName: 'Equipment Plan 1', width: 150 },
//     { field: 'Equipment Plan 2', headerName: 'Equipment Plan 2', width: 150 },
//     { field: 'Equipment Plan 3', headerName: 'Equipment Plan 3', width: 150 },
//     { field: 'Equipment Plan 4', headerName: 'Equipment Plan 4', width: 150 },
//     { field: 'Equipment Plan 5', headerName: 'Equipment Plan 5', width: 150 },
//     { field: 'Equipment Plan 6', headerName: 'Equipment Plan 6', width: 150 },
//     { field: 'Equipment Price 1', headerName: 'Equipment Price 1', width: 150 },
//     { field: 'Equipment Price 2', headerName: 'Equipment Price 2', width: 150 },
//     { field: 'Equipment Price 3', headerName: 'Equipment Price 3', width: 150 },
//     { field: 'Equipment Price 4', headerName: 'Equipment Price 4', width: 150 },
//     { field: 'Equipment Price 5', headerName: 'Equipment Price 5', width: 150 },
//     { field: 'Equipment Price 6', headerName: 'Equipment Price 6', width: 150 },
//     {
//       field: 'actions',
//       type: 'actions',
//       headerName: 'Actions',
//       width: 120,
//       cellClassName: 'actions',
//       getActions: ({ row }) => [
//         <GridActionsCellItem
//           icon={<EditIcon />}
//           label="Edit"
//           className="textPrimary"
//           onClick={() => handleEditClick(row)}
//           color="inherit"
//         />,
//         <GridActionsCellItem
//           icon={<DeleteIcon />}
//           label="Delete"
//           onClick={() => handleDeleteClick(row.id || row.ContractNumber)} // Use actual DB ID or ContractNumber for deletion
//           color="inherit"
//         />,
//       ],
//     },
//   ];

//   // Map data to DataGrid rows (ensure each row has a unique 'id' property)
//   const rows = filteredContracts.map((contract, index) => ({
//     // Use the actual 'id' from the database if available, otherwise fallback to ContractNumber
//     // If neither is unique, you might need to generate a temporary unique ID for DataGrid
//     id: contract.id || contract.ContractNumber || `row-${index}`,
//     ...contract,
//   }));

//   return (
//     <Box m="20px">

//       <Box display="flex" justifyContent="space-between" mb="20px">
//         {/* Search Bar */}
//         <Box
//           display="flex"
//           backgroundColor={colors.backgroundLightGrey} // Changed to light grey
//           borderRadius="3px"
//           width="300px"
//         >
//           <InputBase
//             sx={{ ml: 2, flex: 1, color: colors.grey[100] }} // Text color for input
//             placeholder="Search contracts..."
//             onChange={(e) => setSearchText(e.target.value)}
//             value={searchText}
//           />
//           <IconButton type="button" sx={{ p: 1 }}>
//             <SearchIcon sx={{ color: colors.grey[100] }} /> {/* Icon color */}
//           </IconButton>
//         </Box>

//         {/* Action Buttons */}
//         <Box display="flex" gap="10px">
//           <Button
//             onClick={handleAddClick}
//             sx={{
//               backgroundColor: colors.greenAccent[600],
//               color: colors.grey[100],
//               '&:hover': { backgroundColor: colors.greenAccent[700] },
//               padding: '10px 20px',
//               borderRadius: '8px',
//             }}
//             startIcon={<AddIcon />}
//           >
//             Add New Contract
//           </Button>
//           <ExportButton data={rows} fileName="All Contracts" />
//         </Box>
//       </Box>

//       {loading && (
//         <Box display="flex" justifyContent="center" alignItems="center" height="300px">
//           <CircularProgress />
//           <Typography ml={2} color={colors.grey[100]}>Loading contracts...</Typography>
//         </Box>
//       )}

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//       )}

//       {!loading && !error && (
//         <Box
//           m="20px 0 0 0"
//           height="70vh" // Adjust height as needed
//           sx={{
//             "& .MuiDataGrid-root": {
//               border: "none",
//             },
//             "& .MuiDataGrid-cell": {
//               borderBottom: "none",
//             },
//             "& .MuiDataGrid-columnHeaders": {
//               backgroundColor: colors.backgroundMediumGrey, // Changed to medium grey
//               borderBottom: "none",
//             },
//             "& .MuiDataGrid-virtualScroller": {
//               backgroundColor: colors.backgroundLightGrey, // Changed to light grey
//             },
//             "& .MuiDataGrid-footerContainer": {
//               backgroundColor: colors.backgroundMediumGrey, // Changed to medium grey
//               borderTop: "none",
//             },
//             "& .MuiCheckbox-root": {
//               color: `${colors.greenAccent[200]} !important`,
//             },
//             "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
//               color: `${colors.grey[100]} !important`,
//             },
//             color: colors.grey[100], // Ensure text color is visible
//           }}
//         >
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pageSize={10}
//             rowsPerPageOptions={[5, 10, 20]}
//             checkboxSelection
//             disableSelectionOnClick
//           />
//         </Box>
//       )}

//       {modalOpen && (
//         <ContractFormModal
//           open={modalOpen}
//           handleClose={() => {
//             setModalOpen(false);
//             setSelectedContract(null); // Clear selected contract on close
//           }}
//           contractData={selectedContract}
//           onSave={handleSaveContract}
//         />
//       )}
//     </Box>
//   );
// };

// export default ContractManagementPage;
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid,GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import Tooltip from '@mui/material/Tooltip';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import InputBase from "@mui/material/InputBase";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import formatDate from "../../../components/global/dateFormatter";
import AirtimeAdminVoucher from "../../../components/global/AirtimeAdminVoucher";

const AdminContracts = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [userData, setUserData] = useState(null);
  const { role } = useSelector((state) => state.auth);
  const handleClose = () => setModalOpen(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/staffContracts`);
        setData(response.data);
        console.log("data :", response.data)
      } catch (error) {
        // console.log(error);
        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

  const handleContractSelection = async (id) =>{
    if(!id) return
    console.log("🔍 Admin Contracts - Contract ID: ",id)
    try{
       const response = await axiosInstance.get(
        `/contracts/single/${id}`
      );
      console.log("📦 Admin Contracts - API Response: ",response.data)
      console.log("📦 Admin Contracts - Contracts data: ",response.data.contracts)
      console.log("📦 Admin Contracts - Package data: ",response.data.package)
      console.log("📦 Admin Contracts - DeviceName: ",response.data.contracts?.DeviceName)
      console.log("📦 Admin Contracts - DevicePrice: ",response.data.contracts?.DevicePrice)
      setUserData(response.data || {}); // Assuming you want the first element in the array
      setModalOpen(true);
    }catch (error) {
      console.error("❌ Admin Contracts - Error fetching user data:", error);
    }
  }

  const columns = [
    { field: "id", headerName: "#", width: 100 },
    { field: "FullName", headerName: "Full Name", width: 200 },
    { field: "PackageName", headerName: "Package", width: 180 },
    { field: "DeviceName", headerName: "Device Name", width: 180 },
    { field: "DevicePrice", headerName: "Device Price", width: 180 },
    { field: "DeviceMonthlyPrice", headerName: "Device Monthly Price", width: 180 },
    { field: "ContractStartDate", headerName: "Allocation Date", width: 110 },
    { field: "ContractEndDate", headerName: "Contract End Date", width: 110 },
    { field: "MSISDN", headerName: "MSISDN", width: 120 },
    {
      field: "SubscriptionStatus",
      headerName: "Subscription Status",
      width: 150,
    },
    {
      field: "ApprovalStatus",
      headerName: "Status",
      width: 100,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={() => handleContractSelection(row.id)}
          color="inherit"
        />,
      ],
    },
    // { field: "EmployeeCode", headerName: "Employee Code", width: 180 },
  ];

  const mapDataToRows = (data) => {
    return data.map((bundle, index) => ({
      id: bundle.ContractNumber,
      FullName: bundle.FullName,
      PackageName: bundle.PackageName,
      DeviceName: bundle.DeviceName,
      DevicePrice: bundle.DevicePrice,
      DeviceMonthlyPrice: bundle.DeviceMonthlyPrice,
      ContractStartDate: formatDate(bundle.ContractStartDate),
      ContractEndDate: formatDate(bundle.ContractEndDate),
      MSISDN: bundle.MSISDN,
      SubscriptionStatus: bundle.SubscriptionStatus,
      ApprovalStatus: bundle.ApprovalStatus
      // EmployeeCode: bundle.EmployeeCode,
    }));
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
            (contract) =>
              contract.FullName.toLowerCase().includes(searchText) ||
              contract.PackageName.toLowerCase().includes(searchText)
          );

    setFilteredRows(mapDataToRows(filteredData));
  };

  useEffect(() => {
    setFilteredRows(mapDataToRows(data));
  }, [data]);

  return (
    <Box m="2px" className="">
      <div
        style={{
          height: 500,
          width: "96%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* <h3>Employees</h3> */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Box
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
          <ExportButton data={rows} fileName="All Staff Contracts" />
        </div>
        {
          modalOpen && (
           <AirtimeAdminVoucher
            style={{ height: "100%" }}
            open={modalOpen}
            handleClose={handleClose}
            userData={userData}
            role={role}
          />
          )
        }
        <Box
          m="20px 0 0 0"
          height="55vh"
          //   width = "80%"
          //   margin = "auto"
          //   marginTop={"10px"}
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
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
          />
        </Box>
      </div>
    </Box>
  );
};

export default AdminContracts;
