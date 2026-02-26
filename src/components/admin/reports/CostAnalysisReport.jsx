import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axiosInstance from "../../../utils/axiosInstance";

const CostAnalysisReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/financial/cost-analysis");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching cost analysis data:", error);
      setError("Failed to fetch cost analysis data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading cost analysis data...</Typography>
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
        No cost analysis data available
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
        Cost Analysis Report
      </Typography>
      
      <Grid container spacing={3}>
        {/* Monthly Cost Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Cost Trends (Last 12 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.monthlyCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalMonthlyCost' ? formatCurrency(value) : value,
                      name === 'totalMonthlyCost' ? 'Total Monthly Cost' : 
                      name === 'activeContracts' ? 'Active Contracts' : 'Avg Monthly Payment'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="totalMonthlyCost" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="activeContracts" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost by Department */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.costByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Department" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="totalCost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Costs Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Costs Summary
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Total Device Cost:</strong> {formatCurrency(data.deviceCosts.totalDeviceCost)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Average Device Cost:</strong> {formatCurrency(data.deviceCosts.avgDeviceCost)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Devices Allocated:</strong> {data.deviceCosts.devicesAllocated}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upfront Payments Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upfront Payments Summary
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Total Upfront Payments:</strong> {formatCurrency(data.upfrontPayments.totalUpfrontPayments)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Average Upfront Payment:</strong> {formatCurrency(data.upfrontPayments.avgUpfrontPayment)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Upfront Payment Count:</strong> {data.upfrontPayments.upfrontPaymentCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Cost Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Department Cost Breakdown
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                      <TableCell align="right">Contract Count</TableCell>
                      <TableCell align="right">Avg Cost per Contract</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.costByDepartment.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell>{dept.Department}</TableCell>
                        <TableCell align="right">{formatCurrency(dept.totalCost)}</TableCell>
                        <TableCell align="right">{dept.contractCount}</TableCell>
                        <TableCell align="right">{formatCurrency(dept.avgCostPerContract)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CostAnalysisReport;
