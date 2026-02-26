import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, useTheme, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import formatDate from "../../global/dateFormatter";

const Table = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const getInitialPageSize = () => {
    const storedSize = localStorage.getItem("pageSize");
    return storedSize ? Number(storedSize) : 5; // Default to 5
  };

  const getInitialPage = () => {
    const storedPage = localStorage.getItem("page");
    return storedPage ? Number(storedPage) : 0; // Default to 0
  };

  const [pageSize, setPageSize] = useState(getInitialPageSize());
  const [page, setPage] = useState(getInitialPage());

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/handsets/staffHandsets`);
        console.log(response.data)
        setData(response.data);
      } catch (error) {
        // console.log(error);
        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "EmployeeCode", headerName: "EMPLOYEE CODE", width: 150 },
    { field: "HandsetName", headerName: "HANDSET NAME", width: 200 },
    { field: "CollectionDate", headerName: "ALLOCATION DATE", width: 160 },
    { field: "RenewalDate", headerName: "RENEWAL DATE", width: 160 },
    { field: "Status", headerName: "STATUS", width: 100 },
  ];

  const mapDataToRows = (data) => {
    return data?.map((handset, index) => ({
      id: index + 1,
      EmployeeCode: handset.EmployeeCode,
      HandsetName: handset?.HandsetName,
      CollectionDate: formatDate(handset?.CollectionDate),
      RenewalDate: formatDate(handset?.RenewalDate),
      Status: handset.status || handset.Status,
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
            (handsets) =>
              handsets.FullName.toLowerCase().includes(searchText) ||
              handsets.HandsetName.toLowerCase().includes(searchText) ||
              handsets.RenewalDate.toLowerCase().includes(searchText)
          );

    setFilteredRows(mapDataToRows(filteredData));
  };

  useEffect(() => {
    setFilteredRows(mapDataToRows(data));
  }, [data]);

  return (
    <Box>
      <div
        style={{
          width: "100%", // Ensure the div is full width
          maxWidth: "99%", // Control max width
          marginLeft: "auto",
          marginRight: "auto",
         
        }}
      >
        <Box
          m="10px 0 0 0"
       
          width="100%" // Ensure Box takes full width
          maxWidth="100%" // Ensure it doesn't go beyond full width
          overflowX="auto" // Enable horizontal scroll
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
          <div className="d-flex flex-row justify-content-between">
            <Typography
              variant="h5"
              color="textPrimary"
              fontWeight="bold"
              sx={{ mb: 1, m: 3, fontSize: "20px" }}
            >
              Active Handset Allocation
            </Typography>

            <Box className="d-flex col-md-6 border h-75 mt-3" width="250px">
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search"
                onChange={handleSearchChange}
              />
              <IconButton type="button" sx={{ p: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
          </div>

          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(0);
            }}
            pagination
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            checkboxSelection
            disableSelectionOnClick
            sx={{
              height: "10%", // Keep height within bounds
              maxHeight: "45vh", // Prevent vertical spillover
              width: "100%", // Ensure DataGrid stays within the box
              maxWidth: "100%", // Control width to prevent spilling over
              overflowX: "hidden", // Horizontal scroll if content is too wide
            }}
          />
        </Box>
      </div>
    </Box>
  );
};

export default Table;
