import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";

const DoughnutChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prepaidResponse, postpaidResponse] = await Promise.all([
        axiosInstance.get("/staffmember/prepaidCount"),
        axiosInstance.get("/staffmember/postpaidCount"),
      ]);

      const prepaidCount = prepaidResponse.data.count || 0;
      const postpaidCount = postpaidResponse.data.count || 0;

      setData([
        {
          id: "Prepaid",
          label: "Prepaid",
          value: prepaidCount,
          color: "#D73832",
        },
        {
          id: "Postpaid",
          label: "Postpaid",
          value: postpaidCount,
          color:  "#1674BB",
        },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Custom tooltip to display label and value
  const CustomTooltip = ({ datum }) => (
    <div
      style={{
        padding: "12px",
        background: "white",
        border: `1px solid ${datum.color}`,
        borderRadius: "3px",
      }}
    >
      <strong>{datum.label}</strong>
      <br />
      Value: {datum.value}
    </div>
  );

  return (
    <Box m="20px">
      <Typography
        variant="h6"
        color="textPrimary"
        fontWeight="bold"
        sx={{ mb: 1, m: 3, fontSize: "16px" }}
      >
        Service Plan
      </Typography>
      <Box height="240px">
        <ResponsivePie
          data={data}
          colors={({ data }) => data.color}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.7}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]],
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["darker", 2]],
          }}
          // Enable arc labels
          enableArcLabels={false}
          arcLabel={(d) => ` ${d.value}`}
          tooltip={CustomTooltip} // Add custom tooltip
          defs={[
            {
              id: "dots",
              type: "patternDots",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              size: 4,
              padding: 1,
              stagger: true,
            },
            {
              id: "lines",
              type: "patternLines",
              background: "inherit",
              color: "rgba(255, 255, 255, 0.3)",
              rotation: -45,
              lineWidth: 6,
              spacing: 10,
            },
          ]}
          fill={[
            {
              match: { id: "Prepaid" },
            },
            {
              match: { id: "Postpaid" },
            },
          ]}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: "#999",
              itemDirection: "left-to-right",
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      </Box>
    </Box>
  );
};

export default DoughnutChart;
