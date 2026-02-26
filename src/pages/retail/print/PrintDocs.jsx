import React, { useMemo, useState } from "react";
import { Box, Button, InputBase } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import { tokens } from "../../../theme";

const PrintDocs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [filter, setFilter] = useState("");

  const rows = useMemo(
    () => [
      { id: 1, RequestNumber: "HR-0611", Employee: "EMP700", ControlCard: "CC-7001", PickupList: "PL-8001" },
      { id: 2, RequestNumber: "HR-0612", Employee: "EMP723", ControlCard: "CC-7002", PickupList: "PL-8002" },
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
    { field: "ControlCard", headerName: "Control Card", width: 160 },
    { field: "PickupList", headerName: "Pickup List", width: 160 },
    {
      field: "actions",
      headerName: "Actions",
      width: 240,
      renderCell: (params) => (
        <>
          <Button variant="contained" onClick={() => window.print()}>Print Control Card</Button>
          <Button variant="outlined" sx={{ ml: 1 }} onClick={() => window.print()}>Print Pickup List</Button>
        </>
      ),
    },
  ];

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

export default PrintDocs;


