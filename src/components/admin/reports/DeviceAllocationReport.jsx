import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import axiosInstance from "../../../utils/axiosInstance";

const DeviceAllocationReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/devices/allocation");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching device allocation data:", error);
      setError("Failed to fetch device allocation data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading device allocation data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No device allocation data available
      </Alert>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NA', {
      style: 'currency',
      currency: 'NAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Device Allocation Report
      </Typography>
      
      <Grid container spacing={3}>
        {/* Device Distribution Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Distribution (Top 10)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.deviceDistribution.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="DeviceName" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalValue' ? formatCurrency(value) : value,
                      name === 'totalValue' ? 'Total Value' : 
                      name === 'allocationCount' ? 'Allocations' : 'Avg Price'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="allocationCount" fill="#8884d8" name="Allocations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Allocation Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Allocation Trends (Last 12 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.allocationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="deviceAllocations" stroke="#8884d8" strokeWidth={2} name="Device Allocations" />
                  <Line type="monotone" dataKey="totalContracts" stroke="#82ca9d" strokeWidth={2} name="Total Contracts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Device Usage */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Device Usage
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.departmentDeviceUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="Department" type="category" width={100} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'deviceUsagePercentage' ? `${value}%` : value,
                      name === 'deviceUsagePercentage' ? 'Device Usage %' : 
                      name === 'deviceCount' ? 'Device Count' : 'Total Contracts'
                    ]}
                  />
                  <Bar dataKey="deviceCount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Distribution Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Complete Device Distribution
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device Name</TableCell>
                      <TableCell align="right">Allocations</TableCell>
                      <TableCell align="right">Total Value</TableCell>
                      <TableCell align="right">Average Price</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.deviceDistribution.map((device, index) => {
                      const totalAllocations = data.deviceDistribution.reduce((sum, d) => sum + d.allocationCount, 0);
                      const percentage = ((device.allocationCount / totalAllocations) * 100).toFixed(2);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{device.DeviceName}</TableCell>
                          <TableCell align="right">{device.allocationCount}</TableCell>
                          <TableCell align="right">{formatCurrency(device.totalValue)}</TableCell>
                          <TableCell align="right">{formatCurrency(device.avgPrice)}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Device Usage Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Device Usage Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Device Count</TableCell>
                      <TableCell align="right">Total Contracts</TableCell>
                      <TableCell align="right">Device Usage %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.departmentDeviceUsage.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell>{dept.Department}</TableCell>
                        <TableCell align="right">{dept.deviceCount}</TableCell>
                        <TableCell align="right">{dept.totalContracts}</TableCell>
                        <TableCell align="right">{dept.deviceUsagePercentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.deviceDistribution.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Different Device Types
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.deviceDistribution.reduce((sum, device) => sum + device.allocationCount, 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Device Allocations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(data.deviceDistribution.reduce((sum, device) => sum + device.totalValue, 0))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Device Value
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(data.deviceDistribution.reduce((sum, device) => sum + device.avgPrice, 0) / data.deviceDistribution.length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average Device Price
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceAllocationReport;
