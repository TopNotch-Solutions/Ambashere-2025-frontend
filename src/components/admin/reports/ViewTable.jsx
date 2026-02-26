import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import DownloadButton from "./DownloadButton";

const ViewTable = ({ selectedRow }) => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [setSelectedRow] = useState(null);

  const EmployeeReport = () => {
    useEffect(() => {
      fetch("http://localhost:3001/contracts/staffContracts")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log(err));
    }, []);

    const columns = [
      { field: "id", headerName: "#", width: 60 },
      { field: "DeviceName", headerName: "NAME", width: 220 },
      { field: "PackageName", headerName: "PACKAGE", width: 220 },
      { field: "FixedAssetCode", headerName: "IMEI", width: 180 },
      { field: "StaffPrice", headerName: "PRICE", width: 160 },
      { field: "MSISDN", headerName: "MSISDN", width: 180 },
      { field: "UpfrontPayment", headerName: "UPFRONT PAYMENT", width: 180 },
      { field: "BillingDate", headerName: "ALLOCATION DATE", width: 180 },
    ];

    const rows = data.map((contract, index) => ({
      id: index + 1,
      DeviceName: contract.DeviceName,
      PackageName: contract.PackageName,
      FixedAssetCode: contract.FixedAssetCode,
      StaffPrice: "N$ " + contract.StaffPrice,
      MSISDN: contract.MSISDN,
      UpfrontPayment: "N$ " + contract.UpfrontPayment,
      BillingDate: contract.BillingDate,
    }));

    return (
      <Box sx={{ width: "95%" }}>
        <div className="d-flex justify-content-end mb-4">
          <DownloadButton data={data} fileName="EmployeeReport" />
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

  const IndividualEmployeeReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const InactiveEmployeesReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const InternalBenefitsReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const UtilisationReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const BenefitUsageReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const ActiveEmployeesReport = () => {
    return <div>Inactive Employees Report</div>;
  };

  const renderReport = () => {
    switch (selectedRow.id) {
      case 1:
        return <EmployeeReport />;
      case 2:
        return <IndividualEmployeeReport />;
      case 3:
        return <InactiveEmployeesReport />;
      case 4:
        return <InternalBenefitsReport />;
      case 5:
        return <UtilisationReport />;
      case 6:
        return <BenefitUsageReport />;
      case 7:
        return <ActiveEmployeesReport />;
      default:
        return <div>No report selected</div>;
    }
  };

  return <Box sx={{ width: "100%" }}>{selectedRow && renderReport()}</Box>;
};

export default ViewTable;
