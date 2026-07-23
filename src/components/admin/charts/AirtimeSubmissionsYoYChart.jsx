import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import moment from "moment";
import { tokens } from "../../../theme";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AirtimeSubmissionsYoYChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentYear = moment().year();
  const previousYear = currentYear - 1;

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "/contracts/submissions/perMonth"
        );
        setRawData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching submissions per month:", error);
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    const buildSeries = (year) =>
      MONTHS.map((monthName, index) => {
        const key = `${year}-${String(index + 1).padStart(2, "0")}`;
        const match = rawData.find((item) => item.month === key);
        return {
          x: monthName,
          y: match ? Number(match.count) || 0 : 0,
        };
      });

    return [
      {
        id: String(currentYear),
        color: "hsl(211, 70%, 50%)",
        data: buildSeries(currentYear),
      },
      {
        id: String(previousYear),
        color: "hsl(5, 70%, 50%)",
        data: buildSeries(previousYear),
      },
    ];
  }, [rawData, currentYear, previousYear]);

  if (loading) {
    return <p className="p-4 mb-0">Loading chart...</p>;
  }

  return (
    <div className="p-3" style={{ height: "100%", width: "100%" }}>
      <h6 className="summary-title mb-2">
        Submissions: {currentYear} vs {previousYear}
      </h6>
      <div style={{ height: "280px", width: "100%" }}>
        <ResponsiveLine
          data={chartData}
          theme={{
            textColor: colors.grey[100],
            axis: {
              domain: {
                line: {
                  stroke: colors.grey[100],
                },
              },
              legend: {
                text: {
                  fill: colors.grey[100],
                },
              },
              ticks: {
                line: {
                  stroke: colors.grey[100],
                  strokeWidth: 1,
                },
                text: {
                  fill: colors.grey[100],
                },
              },
            },
            legends: {
              text: {
                fill: colors.grey[100],
              },
            },
          }}
          margin={{ top: 30, right: 110, bottom: 50, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            stacked: false,
            reverse: false,
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Month",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Submissions",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          colors={{ datum: "color" }}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          legends={[
            {
              anchor: "top-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AirtimeSubmissionsYoYChart;
