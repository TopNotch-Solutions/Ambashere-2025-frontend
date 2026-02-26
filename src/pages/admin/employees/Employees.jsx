import { Box, IconButton, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import ExportButton from "../../../components/admin/ExportButton";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AddEmployee from "../../../components/admin/AddEmployee";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";

const Employees = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/staffmember`);
        setData(response.data);
      } catch (error) {
        // console.log(error);
        throw error;
      }
    };

    fetchData();
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 180 },
    { field: "FullName", headerName: "Full Name", width: 220 },
    { field: "Email", headerName: "Email", width: 220 },
    { field: "PhoneNumber", headerName: "Phone", width: 180 },
    { field: "EmploymentCategory", headerName: "Category", width: 160 },
    { field: "EmploymentStatus", headerName: "Status", width: 180 },
    { field: "Department", headerName: "Department", width: 180 },
    {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="edit"
          className="textPrimary"
          onClick={() => handleEditClick(row)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<RemoveCircleIcon />}
          label="inactive"
          className="textPrimary"
          onClick={() => handleRemoveClick(row)}
          color="inherit"
        />,
      ],
    },
  ];

  const rows = data.map((employees, index) => ({
    id: index + 1,
    FullName: employees.FullName,
    Email: employees.Email,
    PhoneNumber: employees.PhoneNumber,
    EmploymentCategory: employees.EmploymentCategory,
    EmploymentStatus: employees.EmploymentStatus,
    Department: employees.Department,
    Division: employees.Division,
    EmployeeCode: employees.EmployeeCode,
  }));

  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);

  const handleSearchChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearchText(searchText);

    const filteredData =
      searchText === ""
        ? data
        : data.filter(
            (employee) =>
              employee.FullName.toLowerCase().includes(searchText) ||
              employee.EmployeeCode.toLowerCase().includes(searchText)
          );

    setFilteredRows(
      filteredData.map((employee, index) => ({
        ...employee,
        id: index + 1,
      }))
    );
  };

  useEffect(() => {
    setFilteredRows(
      data.map((employee, index) => ({
        ...employee,
        id: index + 1,
      }))
    );
  }, [data]);

  const handleRowClick = (row) => {
    navigate(`/staffDetails/${row.EmployeeCode}`);
  };

  const handleOpen = () => {
    setCurrentEmployee(null); // Clear current employee data when opening for adding a new employee
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);

  const handleAddNewEmployee = () => {
    setModalMode("add");
    setCurrentEmployee({});
    setModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setCurrentEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleRemoveClick = (employee) => {
    setCurrentEmployee(employee);
    setModalMode("inactive");
    setModalOpen(true);
  };

  return (
    <Box m="2px" className="">
      <div
        style={{
          height: 500,
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="d-flex flex-row justify-content-between">
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
            <div className="d-flex col-md-4 justify-content-between">
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
                onClick={handleAddNewEmployee}
              >
                Add New Employee
                <PersonAddAlt1Icon size={16} />
              </Button>
              <ExportButton data={rows} fileName="Employees" />
            </div>
          ) : (
            <p></p>
          )}
        </div>

        <Box
          m="20px 0 0 0"
          height="65vh"
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
            onRowClick={(params) => handleRowClick(params.row)}
          />
        </Box>

        {modalOpen && (
          <div className="modal">
            <div className="modal-content">
              <AddEmployee
                style={{ height: "100%" }}
                open={modalOpen}
                handleClose={handleClose}
                mode={modalMode}
                employeeData={currentEmployee}
              />
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default Employees;
