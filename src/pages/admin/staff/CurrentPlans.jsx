import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {  CircularProgress, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";

const CurrentPlans = () => {
  const { employeeCode } = useParams();
  const [benefit, setBenefit] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchBenefit = async () => {
      try {
        const response = await axiosInstance.get(
          `/airtime/${employeeCode}`
        );
        setBenefit(response.data[response.data.length - 1]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching airtime benefit:", error);
        setLoading(false);
      }
    };

    const fetchAllRows = async () => {
      try {
        const response = await axiosInstance.get(
          `/airtime/handsets/${employeeCode}`
        );
        const rowsWithIds = response.data.map((row, index) => ({
          ...row,
          id: index + 1,
        }));
        setRows(rowsWithIds);
      } catch (error) {
        console.error("Error fetching all rows:", error);
      }
    };

    fetchBenefit();
    fetchAllRows();
  }, [employeeCode]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!benefit) {
    return <div>Error: Unable to fetch airtime data.</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return formattedDate;
  };

  const formatMonth = (params) => {
    const date = new Date(params.value);
    if (isNaN(date.getTime())) {
      return ""; // Return empty string if the date string is invalid
    }
    const month = date.toLocaleString("default", { month: "short" });
    return month.substring(0, 3); // Get the first 3 characters of the month name
  };

  const columns = [
    { field: "id", headerName: "#", width: 60 },
    {
      field: "Month",
      headerName: "Month",
      width: 120,
      valueFormatter: formatMonth,
    },
    { field: "AirtimeAmount", headerName: "Amount", width: 120 },
    {
      field: "TopUpDate",
      headerName: "AllocationDate",
      width: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      },
    },
    { field: "AllocationCheck", headerName: "Status", width: 180 },
  ];

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row m-auto">

        {/* CONTACT INFO  */}
        <div className="col-8 col-lg-4 border rounded-3 d-flex flex-column p-3 b-g">
          <div className="position-relative">
            <div className="row">
              <div className="d-flex row text-center">
                <h5>CONTACT INFORMATION</h5>
                <div className="border-bottom"></div>
                <div className="col mt-2">
                  <p>Benefit Amount</p>
                  <p>Benefit Category</p>
                  <p>Benefit Start Date</p>
                  <p>Mobile Phone</p>
                  <p>Service Plan Category</p>
                </div>
                <div className="col mt-2">
                  {" "}
                  <p>N${benefit.AirtimeAmount}</p>
                  <p>{benefit.BenefitType}</p>
                  <p>{formatDate(benefit.TopUpDate)}</p>
                  <p>{benefit.PhoneNumber}</p>
                  <p>{benefit.PlanType}</p>
                </div>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlans;
