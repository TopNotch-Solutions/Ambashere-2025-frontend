import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Grid,
  Card,
  CardContent,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FaDownload } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import * as XLSX from "xlsx/xlsx.mjs";
import { tokens } from "../../../theme";
import { DataGrid } from "@mui/x-data-grid";
import { dataGridTableSx } from "./reportTableStyles";
import axiosInstance from "../../../utils/axiosInstance";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NA", {
    style: "currency",
    currency: "NAD",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const normalizeSearchValue = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[-\s]/g, "");

const matchesEmployeeSearch = (row, searchText) => {
  if (!searchText) return true;

  const query = searchText.toLowerCase().trim();
  const normalizedQuery = normalizeSearchValue(query);

  return (
    row.fullName?.toLowerCase().includes(query) ||
    row.employeeCode?.toLowerCase().includes(query) ||
    normalizeSearchValue(row.employeeCode).includes(normalizedQuery)
  );
};

const filterViolations = (rows, searchText) =>
  rows.filter((row) => matchesEmployeeSearch(row, searchText));

const mapViolationRowsForExport = (rows) =>
  rows.map((row) => ({
    "Employee Name": row.fullName,
    "Employee Code": row.employeeCode,
    Department: row.department,
    "No. of Contracts": row.contractCount,
    "Airtime Allocation": row.airtimeAllocation,
    "70% Limit": row.allowanceLimit,
    "Total Monthly Payment": row.totalMonthlyPayment,
    "Amount Over Limit": row.excessAmount,
    "Limit Check": row.limitCheck,
    "Contract Scope": row.contractScope,
    "Contract Details": row.contractDetails,
  }));

const downloadViolationsXlsx = (activeRows, doneRows, searchText) => {
  const workbook = XLSX.utils.book_new();
  const activeSheet = XLSX.utils.json_to_sheet(
    mapViolationRowsForExport(activeRows)
  );
  const doneSheet = XLSX.utils.json_to_sheet(
    mapViolationRowsForExport(doneRows)
  );

  XLSX.utils.book_append_sheet(workbook, activeSheet, "Active Violations");
  XLSX.utils.book_append_sheet(workbook, doneSheet, "Done Violations");

  const suffix = searchText.trim() ? "-filtered" : "";
  XLSX.writeFile(workbook, `Limit Violations Report${suffix}.xlsx`);
};

const violationColumns = [
  { field: "fullName", headerName: "Employee Name", width: 200 },
  { field: "employeeCode", headerName: "Employee Code", width: 140 },
  { field: "department", headerName: "Department", width: 150 },
  {
    field: "contractCount",
    headerName: "No. of Contracts",
    width: 130,
    type: "number",
  },
  {
    field: "airtimeAllocation",
    headerName: "Airtime Allocation",
    width: 150,
    valueFormatter: ({ value }) => formatCurrency(value),
  },
  {
    field: "allowanceLimit",
    headerName: "70% Limit",
    width: 130,
    valueFormatter: ({ value }) => formatCurrency(value),
  },
  {
    field: "totalMonthlyPayment",
    headerName: "Total Monthly Payment",
    width: 170,
    valueFormatter: ({ value }) => formatCurrency(value),
  },
  {
    field: "excessAmount",
    headerName: "Amount Over Limit",
    width: 150,
    valueFormatter: ({ value }) => formatCurrency(value),
  },
  {
    field: "limitCheck",
    headerName: "Limit Check",
    width: 140,
    renderCell: (params) => (
      <Chip label={params.value} color="error" size="small" />
    ),
  },
  {
    field: "contractDetails",
    headerName: "Contract Details",
    flex: 1,
    minWidth: 420,
  },
];

const LimitViolationsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/reports/compliance/limit-violations"
      );
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch limit violations data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const filteredActiveViolations = filterViolations(
    data.activeViolations,
    searchText
  );
  const filteredDoneViolations = filterViolations(
    data.doneViolations,
    searchText
  );
  const currentRows =
    activeTab === 0 ? filteredActiveViolations : filteredDoneViolations;
  const totalCurrentRows =
    activeTab === 0 ? data.activeViolations.length : data.doneViolations.length;

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]} sx={{ mb: 1 }}>
        Limit Violations Report
      </Typography>
      <Typography variant="body2" color={colors.grey[300]} sx={{ mb: 3 }}>
        Employees whose combined contract monthly payments exceed 70% of their
        airtime allocation.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Violations
              </Typography>
              <Typography variant="h5">
                {data.summary.activeViolationCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Done Violations
              </Typography>
              <Typography variant="h5">
                {data.summary.doneViolationCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Unique Employees in Violation
              </Typography>
              <Typography variant="h5">
                {data.summary.totalEmployeesInViolation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Contracts Reviewed
              </Typography>
              <Typography variant="h5">
                {data.summary.totalActiveContractsReviewed +
                  data.summary.totalDoneContractsReviewed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Box
          display="flex"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          width={{ xs: "100%", sm: 320 }}
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder="Search by name or employee code"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {searchText && (
            <Typography variant="body2" color={colors.grey[300]}>
              Showing {currentRows.length} of {totalCurrentRows} results
              {activeTab === 0 ? " in active contracts" : " in done contracts"}
            </Typography>
          )}

          <Button
            className="download-btn benefits-cta-btn"
            onClick={() =>
              downloadViolationsXlsx(
                filteredActiveViolations,
                filteredDoneViolations,
                searchText
              )
            }
            style={{
              fontSize: "13px",
              background: "linear-gradient(to right, #1A69AC, #00AAE9)",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #0f69ac",
              fontWeight: 700,
            }}
          >
            Download XLSX
            <FaDownload size={16} style={{ marginLeft: "10px" }} />
          </Button>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
      >
        <Tab
          label={`Active Contracts (${
            searchText
              ? filteredActiveViolations.length
              : data.summary.activeViolationCount
          })`}
        />
        <Tab
          label={`Done Contracts (${
            searchText
              ? filteredDoneViolations.length
              : data.summary.doneViolationCount
          })`}
        />
      </Tabs>

      {currentRows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {searchText
            ? `No employees found matching "${searchText}" in ${
                activeTab === 0 ? "active" : "done"
              } contract violations.`
            : "No limit violations found for this category."}
        </Alert>
      ) : null}

      <Box
        height="65vh"
        sx={{
          ...dataGridTableSx,
          "& .MuiDataGrid-cell": {
            ...dataGridTableSx["& .MuiDataGrid-cell"],
            alignItems: "flex-start",
            py: 1,
          },
        }}
      >
        <DataGrid
          rows={currentRows}
          columns={violationColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          getRowHeight={() => "auto"}
        />
      </Box>
    </Box>
  );
};

export default LimitViolationsReport;
