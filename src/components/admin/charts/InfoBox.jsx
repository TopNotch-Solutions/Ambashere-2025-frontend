import React, { useState, useEffect } from "react";
import { Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import ProgressCircle from "./ProgressCircle";
import axiosInstance from "../../../utils/axiosInstance";
import 'bootstrap/dist/css/bootstrap.min.css';

const InfoBox = ({ title, subtitle, icon, endpoint }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [count, setCount] = useState(null);
  const [prevCount, setPrevCount] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(endpoint);
      setPrevCount(count);
      setCount(response.data.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const change = count !== null && prevCount !== null ? count - prevCount : 0;

  return (
    <div className="card w-100">
      <div className="card-body">
        <div className="row">
          <div className="col-12">
            <div className="d-flex">
              {icon}
              <div className="ml-3">
                <Typography
                  variant="h7"
                  fontWeight="bold"
                  sx={{ color: colors.grey[100] }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="h3"
                  fontStyle="italic"
                  sx={{ color: colors.blueAccent[500] }}
                >
                  {count} {/* Display the count value */}
                </Typography>
                <Typography variant="h5" sx={{ color: colors.grey[600] }}>
                  {subtitle}
                </Typography>
              </div>
            </div>
          </div>
          {/* <div className="col-3">
            <ProgressCircle change={change} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
