import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, Alert, Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { tokens } from "../../../theme";
import { useTheme } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const TempStaffInfo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [tempData, setTempData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch temporary user specific data
    const fetchTempData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/contracts/Temp/${currentUser.EmployeeCode}`
        );
        setTempData(response.data || {});
      } catch (error) {
        console.error("Error fetching temporary staff data:", error);
        // Fallback to mock data if API fails
        setTempData({
          airtimeAllocation: 150.00,
          contractStartDate: "2024-01-15",
          contractEndDate: "2024-12-31",
          supervisor: "John Smith",
          hrContact: "hr@mtc.com.na",
          emergencyContact: "+264 81 123 4567"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.EmploymentCategory === "Temporary") {
      fetchTempData();
    }
  }, [currentUser]);

  const infoCards = [
    {
      title: "Employment Details",
      icon: <WorkIcon />,
      color: "#1A69AC",
      items: [
        { label: "Employee Code", value: currentUser?.EmployeeCode || "N/A" },
        { label: "Position", value: currentUser?.Position || "Temporary Staff" },
        { label: "Department", value: currentUser?.Department || "Not Assigned" },
        { label: "Employment Status", value: currentUser?.EmploymentStatus || "Active" },
        { label: "Employment Category", value: currentUser?.EmploymentCategory || "Temporary" }
      ]
    },
    {
      title: "Benefits & Allowances",
      icon: <AttachMoneyIcon />,
      color: "#0096D6",
      items: [
        { label: "Airtime Allowance", value: `N$ ${tempData.airtimeAllocation || "0.00"}` },
        { label: "Contract Start", value: tempData.contractStartDate || "N/A" },
        { label: "Contract End", value: tempData.contractEndDate || "N/A" },
        { label: "Benefits Status", value: "Limited (Temporary Staff)" }
      ]
    },
    {
      title: "Important Contacts",
      icon: <ContactSupportIcon />,
      color: "#1674BB",
      items: [
        { label: "Supervisor", value: tempData.supervisor || "To be assigned" },
        { label: "HR Contact", value: tempData.hrContact || "hr@mtc.com.na" },
        { label: "Emergency Contact", value: tempData.emergencyContact || "N/A" },
        { label: "IT Support", value: "itsupport@mtc.com.na" }
      ]
    }
  ];

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div className="col-12 mb-4">
          <Typography variant="h4" style={{ color: colors.grey[100] }} className="mb-2">
            Temporary Staff Information
          </Typography>
          <Typography variant="body1" style={{ color: colors.grey[300] }}>
            Welcome to your temporary staff portal. Here you can find important information about your employment, benefits, and contacts.
          </Typography>
        </div>

        {/* Important Notice */}
        <div className="col-12 mb-4">
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ 
              backgroundColor: colors.blueAccent[800],
              color: colors.grey[100],
              '& .MuiAlert-icon': {
                color: colors.blueAccent[200]
              }
            }}
          >
            <Typography variant="h6" className="mb-2">
              Important Notice for Temporary Staff
            </Typography>
            <Typography variant="body2">
              As a temporary staff member, you have limited access to certain benefits and features. 
              Your airtime allowance and basic profile management are available. For full benefits access, 
              please contact HR about permanent employment opportunities.
            </Typography>
          </Alert>
        </div>

        {/* Information Cards */}
        <Grid container spacing={3} className="mb-4">
          {isLoading ? (
            <Grid item xs={12}>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="200px"
                sx={{ backgroundColor: colors.primary[400], borderRadius: 2 }}
              >
                <Box textAlign="center">
                  <CircularProgress size={40} sx={{ color: colors.blueAccent[500] }} />
                  <Typography variant="h6" sx={{ mt: 2, color: colors.grey[100] }}>
                    Loading temporary staff information...
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ) : (
            infoCards.map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    backgroundColor: colors.primary[400],
                    border: `1px solid ${card.color}`,
                    '&:hover': {
                      boxShadow: `0 4px 20px ${card.color}40`
                    }
                  }}
                >
                  <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box 
                      sx={{ 
                        backgroundColor: card.color,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="h6" style={{ color: colors.grey[100] }}>
                      {card.title}
                    </Typography>
                  </Box>
                  
                  {card.items.map((item, itemIndex) => (
                    <Box key={itemIndex} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" style={{ color: colors.grey[300] }}>
                        {item.label}:
                      </Typography>
                      <Typography variant="body2" style={{ color: colors.grey[100], fontWeight: 'bold' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))
          )}
        </Grid>

        {/* Quick Actions */}
        <div className="col-12">
          <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h6" style={{ color: colors.grey[100] }} className="mb-3">
                Quick Actions
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/user/Profile")}
                  sx={{ 
                    backgroundColor: "#0096D6",
                    '&:hover': { backgroundColor: "#1A69AC" }
                  }}
                >
                  Update Profile
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/user/Support")}
                  sx={{ 
                    backgroundColor: "#1674BB",
                    '&:hover': { backgroundColor: "#1A69AC" }
                  }}
                >
                  Contact Support
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/user/Calendar")}
                  sx={{ 
                    backgroundColor: "#0096D6",
                    color: "white",
                    '&:hover': { backgroundColor: "#1A69AC" }
                  }}
                >
                  View Calendar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.open("mailto:hr@mtc.com.na?subject=Temporary Staff Inquiry", "_blank")}
                  sx={{ 
                    borderColor: "#1674BB",
                    color: "#1674BB",
                    '&:hover': { 
                      borderColor: "#1A69AC",
                      backgroundColor: "#0096D620"
                    }
                  }}
                >
                  Email HR
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>

        {/* Temporary Staff Guidelines */}
        <div className="col-12 mt-4">
          <Card sx={{ backgroundColor: colors.primary[400] }}>
            <CardContent>
              <Typography variant="h6" style={{ color: colors.grey[100] }} className="mb-3">
                Temporary Staff Guidelines
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: colors.grey[300] }}>
                <li>Your airtime allowance is provided monthly and must be used within the billing cycle</li>
                <li>Profile updates are limited to contact information and basic details</li>
                <li>For technical issues, contact IT support at itsupport@mtc.com.na</li>
                <li>HR inquiries should be directed to hr@mtc.com.na</li>
                <li>Your temporary employment status may be reviewed for permanent opportunities</li>
                <li>All company policies and procedures apply to temporary staff</li>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TempStaffInfo;
