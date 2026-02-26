import React, { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";
import ExportButton from "../ExportButton";

const NewEmployeeReport = () => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/staffmember/new-staff");
        console.log("New staff: ",response.data)
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    { field: "EmployeeCode", headerName: "Employee Code", width: 180 },
    { field: "FullName", headerName: "Full Name", width: 220 },
    { field: "Email", headerName: "Email", width: 220 },
    { field: "PhoneNumber", headerName: "Phone", width: 180 },
    { field: "EmploymentCategory", headerName: "Category", width: 160 },
    { field: "EmploymentStatus", headerName: "Status", width: 180 },
    { field: "Department", headerName: "Department", width: 180 },
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

  return (
    <Box sx={{ width: "auto" }}>
      <div className="d-flex justify-content-end mb-1 mb-md-2">
        <ExportButton data={data} fileName="New Employee Report" />
      </div>
      <Box
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
            backgroundColor: "#1674BB",
            borderBottom: "none",
            color: "white",
          },
          "& .MuiDataGrid-virtualScroller": {
            //   backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            //   backgroundColor: colors.grey[900],
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
          rows={rows}
          columns={columns}
          pageSize={5}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default NewEmployeeReport;
