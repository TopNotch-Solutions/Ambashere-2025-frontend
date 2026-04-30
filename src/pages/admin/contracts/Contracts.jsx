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
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";
import "../../../assets/style/global/adminContracts.css";

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
  const normalizeContractsResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.staffContracts)) return payload.staffContracts;
    if (payload && typeof payload === "object") return Object.values(payload);
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/contracts/staffContracts`);
        setData(normalizeContractsResponse(response.data));
        console.log("data :", response.data);
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
    // { field: "id", headerName: "#", width: 100 },
    { field: "FullName", headerName: "Full Name", width: 200 },
    { field: "PackageName", headerName: "Package", width: 180 },
    { field: "DeviceName", headerName: "Device Name", width: 180 },
    { field: "ContractDuration", headerName: "Duration", width: 120 },
    { field: "DevicePrice", headerName: "Device Price", width: 180 },
    { field: "DeviceUpfrontPayment", headerName: "Upfront Amount", width: 150 },
    { field: "DevicePayoutBalance", headerName: "Payout Balance", width: 150 },
    { field: "DeviceMonthlyPrice", headerName: "Device Monthly Price", width: 180 },
    { field: "ContractStartDate", headerName: "Allocation Date", width: 110 },
    { field: "ContractEndDate", headerName: "Contract End Date", width: 110 },
    { field: "MSISDN", headerName: "MSISDN", width: 120 },
    {
      field: "SubscriptionStatus",
      headerName: "Subscription Status",
      width: 150,
    },
    // {
    //   field: "ApprovalStatus",
    //   headerName: "Status",
    //   width: 100,
    // },
    // {
    //   field: "actions",
    //   type: "actions",
    //   headerName: "Actions",
    //   width: 100,
    //   cellClassName: "actions",
    //   getActions: ({ row }) => [
    //     <GridActionsCellItem
    //       icon={<EditIcon />}
    //       label="Edit"
    //       className="textPrimary"
    //       onClick={() => handleContractSelection(row.id)}
    //       color="inherit"
    //     />,
    //   ],
    // },
    // { field: "EmployeeCode", headerName: "Employee Code", width: 180 },
  ];

  const mapDataToRows = (data) => {
    return data.map((bundle, index) => ({
      id: bundle.id || bundle.ContractNumber || index + 1,
      FullName: bundle.FullName || bundle.full_name || "",
      PackageName: bundle.PackageName || bundle.package || "",
      DeviceName: bundle.DeviceName || bundle.device || "",
      ContractDuration: bundle.ContractDuration || bundle.contract_duration || "",
      DevicePrice: bundle.DevicePrice || bundle.device_initial_cost || "",
      DeviceUpfrontPayment:
        bundle.DeviceUpfrontPayment || bundle.device_upfront_payment || "",
      DevicePayoutBalance:
        bundle.DevicePayoutBalance || bundle.device_payout_balance || "",
      DeviceMonthlyPrice: bundle.DeviceMonthlyPrice || bundle.device_monthly_price || "",
      ContractStartDate: formatDate(bundle.ContractStartDate || bundle.contract_start_date),
      ContractEndDate: formatDate(bundle.ContractEndDate || bundle.contract_end_date),
      MSISDN: bundle.MSISDN || bundle.msisdn || bundle.staff_msisdn || "",
      SubscriptionStatus: bundle.SubscriptionStatus || bundle.subscription_status || "",
      ApprovalStatus: bundle.ApprovalStatus || bundle.subscription_status || ""
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
              (contract.FullName || contract.full_name || "").toLowerCase().includes(searchText) ||
              (contract.PackageName || contract.package || "").toLowerCase().includes(searchText)
          );

    setFilteredRows(mapDataToRows(filteredData));
  };

  useEffect(() => {
    setFilteredRows(mapDataToRows(data));
  }, [data]);

  return (
    <Box m="2px" className="handset-simulator-page admin-contracts-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Contracts</h2>
          <p className="handset-subtitle mb-0">
            Track all staff contracts, allocations, and subscription statuses.
          </p>
        </div>
      </div>
      <div className="admin-contracts-wrap">
        <div className="d-flex justify-content-between admin-contracts-toolbar">
          <Box
            className="admin-contracts-search"
            display="flex"
            borderRadius="8px"
            width="260px"
          >
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search full name or package"
              onChange={handleSearchChange}
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
          <ExportButton data={rows} fileName="All Staff Contracts" className="benefits-cta-btn" />
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
          className="handset-form-card shadow-sm benefits-table-card"
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
          <div className="benefits-grid-wrap">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableSelectionOnClick
            />
          </div>
        </Box>
      </div>
    </Box>
  );
};

export default AdminContracts;
