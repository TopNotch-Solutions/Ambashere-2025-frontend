import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axiosInstance from "../../../utils/axiosInstance";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BenefitUtilizationReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/analytics/benefit-utilization");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching benefit utilization data:", error);
      setError("Failed to fetch benefit utilization data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading benefit utilization data...</Typography>
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
        No benefit utilization data available
      </Alert>
    );
  }

  const getUtilizationColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Benefit Utilization Report
      </Typography>
      
      <Grid container spacing={3}>
        {/* Overall Utilization Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Utilization
              </Typography>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h2" color="primary">
                  {data.overall.utilizationPercentage}%
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {data.overall.employeesWithBenefits} of {data.overall.totalEmployees} employees
                </Typography>
                <Chip 
                  label={data.overall.utilizationPercentage >= 70 ? "Good" : "Needs Improvement"} 
                  color={getUtilizationColor(data.overall.utilizationPercentage)}
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Utilization by Department */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Utilization by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Department" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'utilizationPercentage' ? `${value}%` : value,
                      name === 'utilizationPercentage' ? 'Utilization %' : 
                      name === 'employeesWithBenefits' ? 'Employees with Benefits' : 'Total Employees'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="utilizationPercentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Usage Periods */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Peak Usage Periods (Last 12 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.peakPeriods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newAllocations" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Utilization Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Department Utilization
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Total Employees</TableCell>
                      <TableCell align="right">Employees with Benefits</TableCell>
                      <TableCell align="right">Utilization %</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.byDepartment.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell>{dept.Department}</TableCell>
                        <TableCell align="right">{dept.totalEmployees}</TableCell>
                        <TableCell align="right">{dept.employeesWithBenefits}</TableCell>
                        <TableCell align="right">{dept.utilizationPercentage}%</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={dept.utilizationPercentage >= 70 ? "Good" : "Needs Improvement"} 
                            color={getUtilizationColor(dept.utilizationPercentage)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Utilization Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  • <strong>Overall Utilization:</strong> {data.overall.utilizationPercentage}% of active employees are utilizing benefits
                </Typography>
                <Typography variant="body1" gutterBottom>
                  • <strong>Peak Month:</strong> {data.peakPeriods.length > 0 ? 
                    data.peakPeriods.reduce((max, period) => 
                      period.newAllocations > max.newAllocations ? period : max
                    ).month : 'N/A'} had the highest number of new allocations
                </Typography>
                <Typography variant="body1" gutterBottom>
                  • <strong>Top Performing Department:</strong> {data.byDepartment.length > 0 ? 
                    data.byDepartment.reduce((max, dept) => 
                      dept.utilizationPercentage > max.utilizationPercentage ? dept : max
                    ).Department : 'N/A'} with {data.byDepartment.length > 0 ? 
                    data.byDepartment.reduce((max, dept) => 
                      dept.utilizationPercentage > max.utilizationPercentage ? dept : max
                    ).utilizationPercentage : 0}% utilization
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BenefitUtilizationReport;
