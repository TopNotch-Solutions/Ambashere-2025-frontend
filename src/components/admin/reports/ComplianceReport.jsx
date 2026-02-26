import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Badge } from "@mui/material";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axiosInstance from "../../../utils/axiosInstance";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ComplianceReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/compliance/overview");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      setError("Failed to fetch compliance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading compliance data...</Typography>
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
        No compliance data available
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Within Limit': return 'success';
      case 'Exceeding Limit': return 'error';
      case 'Ongoing': return 'info';
      case 'Expired': return 'error';
      case 'Renewed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Compliance Overview Report
      </Typography>
      
      <Grid container spacing={3}>
        {/* Approval Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approval Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.approvalStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.approvalStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Limit Violations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Limit Compliance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.limitViolations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.limitViolations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.subscriptionStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="SubscriptionStatus" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance Summary
              </Typography>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Approved Contracts:</strong>
                  </Typography>
                  <Chip 
                    label={data.approvalStatus.find(s => s.ApprovalStatus === 'Approved')?.count || 0} 
                    color="success" 
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Pending Approvals:</strong>
                  </Typography>
                  <Chip 
                    label={data.approvalStatus.find(s => s.ApprovalStatus === 'Pending')?.count || 0} 
                    color="warning" 
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Within Limit:</strong>
                  </Typography>
                  <Chip 
                    label={data.limitViolations.find(s => s.LimitCheck === 'Within Limit')?.count || 0} 
                    color="success" 
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    <strong>Exceeding Limit:</strong>
                  </Typography>
                  <Chip 
                    label={data.limitViolations.find(s => s.LimitCheck === 'Exceeding Limit')?.count || 0} 
                    color="error" 
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Approvals
                <Badge badgeContent={data.pendingApprovals.length} color="warning" sx={{ ml: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    ({data.pendingApprovals.length} pending)
                  </Typography>
                </Badge>
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract #</TableCell>
                      <TableCell>Employee Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Monthly Payment</TableCell>
                      <TableCell align="right">Device Price</TableCell>
                      <TableCell align="right">Contract Date</TableCell>
                      <TableCell align="right">Days Pending</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.pendingApprovals.map((contract, index) => (
                      <TableRow key={index}>
                        <TableCell>{contract.ContractNumber}</TableCell>
                        <TableCell>{contract.FullName}</TableCell>
                        <TableCell>{contract.Department}</TableCell>
                        <TableCell align="right">{formatCurrency(contract.MonthlyPayment)}</TableCell>
                        <TableCell align="right">{formatCurrency(contract.DevicePrice || 0)}</TableCell>
                        <TableCell align="right">{new Date(contract.ContractStartDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${contract.daysPending} days`} 
                            color={contract.daysPending > 30 ? 'error' : contract.daysPending > 14 ? 'warning' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={contract.ApprovalStatus} 
                            color={getStatusColor(contract.ApprovalStatus)}
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

        {/* Compliance Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Compliance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.approvalStatus.find(s => s.ApprovalStatus === 'Approved')?.percentage || 0}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Approval Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.limitViolations.find(s => s.LimitCheck === 'Within Limit')?.percentage || 0}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Within Limit Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.pendingApprovals.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Approvals
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {data.pendingApprovals.length > 0 ? 
                        Math.round(data.pendingApprovals.reduce((sum, c) => sum + c.daysPending, 0) / data.pendingApprovals.length) : 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Days Pending
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

export default ComplianceReport;
