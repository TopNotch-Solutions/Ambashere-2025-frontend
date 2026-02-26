import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";
import "../../../assets/style/admin/EmployeeCount.css";

const HorizontalStackChart = () => {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employeeCount, setEmployeeCount] = useState(0);
  const [permanentCount, setPermanentCount] = useState(0);
  const [temporaryCount, setTemporaryCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeeReponse, permanentResponse, temporaryResponse, inactiveResponse] =
        await Promise.all([
          axiosInstance.get("/staffmember/employeeCount"),
          axiosInstance.get("/staffmember/permanentEmployees"),
          axiosInstance.get("/staffmember/temporaryEmployees"),
          axiosInstance.get("/staffmember/inactiveEmployees"),
        ]);

        setEmployeeCount(employeeReponse.data.count || 0)
      setPermanentCount(permanentResponse.data.count || 0)
      setTemporaryCount(temporaryResponse.data.count || 0)
      setInactiveCount(inactiveResponse.data.count || 0)

      // Update data array with actual counts from the API responses
      setData([
        { id: "Permanent", value: permanentCount, color: colors.permanent },
        { id: "Temporary", value: temporaryCount, color: colors.temporary },
        { id: "Inactive", value: inactiveCount, color: colors.inactive },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Box m="20px" p="2px">
      <Typography
        variant="h5"
        color="textPrimary"
        fontWeight="bold"
        sx={{ mt: 2, mb: 2, fontSize: "16px" }}
      >
        Employment Status
      </Typography>

      {/* Total Employee Count */}
      <div className="row mb-2">
        <div className="col">
          <h6>Total Employee</h6>
        </div>
        <div className="col-sm-2">{employeeCount}</div>
      </div>

      {/* Colorful Line Graph */}
      <div className="row mb-4 justify-content-between">
        <div className="col-12 col-md-5 d-flex mb-3 mb-md-0">
          <div className="oval" style={{ backgroundColor: "#25A2EA" }}></div>
        </div>
        <div className="col-12 col-md-4 d-flex mb-3 mb-md-0">
          <div className="oval" style={{ backgroundColor: "#D73832" }}></div>
        </div>
        <div className="col-12 col-md-2 d-flex">
          <div className="oval" style={{ backgroundColor: "#16151C" }}></div>
        </div>
      </div>

      {/* Employement Satus Counts */}
      <div className="pr-3">
        {/* Permanent Employee Count */}
        <div className="row mb-4 justify-content-between">
          <div
            className="col-sm-1 circle"
            style={{ backgroundColor: "#25A2EA" }}
          ></div>
          <div className="col-md-8">Permanent</div>
          <div className="col-sm-2 ">{permanentCount}</div>
        </div>

        {/* Temporary Employee Count */}
        <div className="row mb-4 justify-content-between">
          <div
            className="col-sm-1 circle"
            style={{ backgroundColor: "#D73832" }}
          ></div>
          <div className="col-md-8">Temporary</div>
          <div className="col-sm-2 ">{temporaryCount}</div>
        </div>

        {/* Inactive Employee Count */}
        <div className="row justify-content-between">
          <div
            className="col-sm-1 circle "
            style={{ backgroundColor: "#16151C" }}
          ></div>
          <div className="col-md-8">Inactive</div>
          <div className="col-sm-2">{inactiveCount}</div>
        </div>
      </div>
    </Box>
  );
};

export default HorizontalStackChart;
