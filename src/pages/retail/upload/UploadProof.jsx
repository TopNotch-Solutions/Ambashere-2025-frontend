import React, { useMemo, useRef, useState } from "react";
import { Box, Button, InputBase } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import { tokens } from "../../../theme";

const UploadProof = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [filter, setFilter] = useState("");
  const fileInputRef = useRef();

  const rows = useMemo(
    () => [
      { id: 1, RequestNumber: "HR-0621", Employee: "EMP700", Device: "iPhone 13", Status: "Collected" },
      { id: 2, RequestNumber: "HR-0622", Employee: "EMP723", Device: "Samsung S22", Status: "Collected" },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!filter) return rows;
    const q = filter.toLowerCase();
    return rows.filter(
      (r) => r.RequestNumber.toLowerCase().includes(q) || r.Employee.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  const columns = [
    { field: "RequestNumber", headerName: "Request #", width: 140 },
    { field: "Employee", headerName: "Employee", width: 120 },
    { field: "Device", headerName: "Device", width: 160 },
    { field: "Status", headerName: "Status", width: 160 },
  ];

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      alert(`Uploaded proof for selected row: ${file.name}`);
    }
  };

  return (
    <Box m="2px">
      <div style={{ height: 520, width: "98%", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Box className="d-flex col-md-5" display="flex" backgroundColor={colors.primary[400]} borderRadius="3px" width="360px">
            <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search by Request # or Employee" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <Button type="button" sx={{ p: 1, minWidth: 0 }}>
              <SearchIcon />
            </Button>
          </Box>
          <div>
            <input type="file" accept=".pdf,.jpg,.png" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
            <Button variant="contained" onClick={handleUploadClick}>Upload Collection Proof</Button>
          </div>
        </div>
        <Box m="20px 0 0 0" height="55vh" sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.grey[900], borderBottom: "none" },
            "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
            "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.grey[900] },
          }}>
          <DataGrid rows={filtered} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} />
        </Box>
      </div>
    </Box>
  );
};

export default UploadProof;


