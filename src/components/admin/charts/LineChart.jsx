import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import moment from "moment";
import { tokens } from "../../../theme";

const LineChart = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const currentYear = moment().year(); // Current year
    const [selectedYear, setSelectedYear] = useState(currentYear); // Default year

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [createdRes, endedRes] = await Promise.all([
                    axiosInstance.get("/contracts/createdPerMonth"),
                    axiosInstance.get("/contracts/endedPerMonth"),
                ]);

                // Ensure data is an array, default to empty array if not
                const createdData = Array.isArray(createdRes.data) ? createdRes.data : [];
                const endedData = Array.isArray(endedRes.data) ? endedRes.data : [];

                console.log("Raw createdData", createdData);
                console.log("Raw endedData", endedData);

                // Months for the x-axis
                const months = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];

                // Filter and map data for the selected year
                const createdSeries = createdData
                    .filter(item => {
                        // Ensure item.month exists and is a valid date string
                        const monthMoment = item.month ? moment(item.month, "YYYY-MM") : null;
                        return monthMoment && monthMoment.isValid() && monthMoment.year() === selectedYear;
                    })
                    .map(item => ({
                        x: months[moment(item.month, "YYYY-MM").month()],
                        y: item.count || 0, // Default to 0 if count is missing
                    }));

                const endedSeries = endedData
                    .filter(item => {
                        // Ensure item.month exists and is a valid date string
                        const monthMoment = item.month ? moment(item.month, "YYYY-MM") : null;
                        return monthMoment && monthMoment.isValid() && monthMoment.year() === selectedYear;
                    })
                    .map(item => ({
                        x: months[moment(item.month, "YYYY-MM").month()],
                        y: item.count || 0, // Default to 0 if count is missing
                    }));

                // If a series is empty for the selected year, Nivo might still expect all months for consistency
                // Let's ensure each series has data points for all 12 months, even if count is 0
                const createFullSeries = (series) => {
                    const fullSeries = months.map(monthName => {
                        const existingData = series.find(s => s.x === monthName);
                        return existingData || { x: monthName, y: 0 };
                    });
                    return fullSeries;
                };

                const finalCreatedSeries = createFullSeries(createdSeries);
                const finalEndedSeries = createFullSeries(endedSeries);

                console.log("Final createdSeries:", finalCreatedSeries);
                console.log("Final endedSeries:", finalEndedSeries);


                // Format data for the line chart
                const formattedData = [
                    {
                        id: "Contracts Created",
                        color: "hsl(211, 70%, 50%)",
                        data: finalCreatedSeries,
                    },
                    {
                        id: "Contracts Ended",
                        color: "hsl(5, 70%, 50%)",
                        data: finalEndedSeries,
                    },
                ];

                setData(formattedData);
            } catch (error) {
                console.error("Error fetching contracts data:", error);
                // Optionally set data to an empty array or show an error message on the UI
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]); // Refetch data when selectedYear changes

    if (loading) {
        return <p>Loading...</p>;
    }

    // If data is empty after loading, you might want to show a message
    if (data.length === 0 || (data[0].data.length === 0 && data[1].data.length === 0)) {
        return <p>No contract data available for the selected year.</p>;
    }


    return (
        <div className="p-5" style={{ height: "480px", width: "100%" }}>
            {/* Year Selection Dropdown */}
            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="year-select" style={{ marginRight: "10px" }}>
                    Select Year:
                </label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {Array.from({ length: 5 }).map((_, idx) => {
                        const year = currentYear - idx;
                        return <option key={year} value={year}>{year}</option>;
                    })}
                </select>
            </div>

            {/* Line Chart */}
            <ResponsiveLine
                data={data}
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
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
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
                    legend: "Contracts",
                    legendOffset: -40,
                    legendPosition: "middle",
                }}
                colors={{ scheme: "category10" }}
                pointSize={10}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
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
    );
};

export default LineChart;