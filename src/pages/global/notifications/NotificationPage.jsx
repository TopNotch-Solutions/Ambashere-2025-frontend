import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Fade,
  IconButton, // Import IconButton for the delete button
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined"; // Import the delete icon

// Styled component for individual notification items
const NotificationItem = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  borderLeft: `5px solid transparent`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
}));

// Function to get appropriate icon based on notification type
const getNotificationIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "info":
      return <InfoOutlinedIcon color="info" sx={{ mr: 2, mt: 0.5 }} />;
    case "warning":
      return <WarningAmberOutlinedIcon color="warning" sx={{ mr: 2, mt: 0.5 }} />;
    case "success":
      return <CheckCircleOutlineOutlinedIcon color="success" sx={{ mr: 2, mt: 0.5 }} />;
    default:
      return (
        <NotificationsNoneOutlinedIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
      );
  }
};

const NotificationPage = () => {
  const { role } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // State to control re-fetching after marking as read
  const [shouldReFetch, setShouldReFetch] = useState(true);

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch notifications
        const response = await axiosInstance.get(`/notifications`);
        const fetchedNotifications = response.data;

        setNotifications(fetchedNotifications);

        // 2. Mark all retrieved notifications as read on the backend
        if (fetchedNotifications.length > 0) {
          try {
            // Assuming this endpoint marks all currently fetched notifications as read
            await axiosInstance.put(`/notifications`);
            // It's generally better to update the state directly or re-fetch
            // rather than a full page reload, but keeping it as per original code.
            // For delete, we will update state directly.
            window.location.reload();
          } catch (markError) {
            console.warn("Could not mark notifications as read:", markError);
          }
        }
      } catch (err) {
        console.error("Error fetching or marking notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (shouldReFetch) {
      fetchAndMarkNotifications();
      setShouldReFetch(false); // Reset to prevent infinite loop
    }
  }, [shouldReFetch]); // Re-fetch if shouldReFetch is true

  // Function to handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      // Make API call to delete the notification
      await axiosInstance.delete(`/notifications/${notificationId}`);
      // Filter out the deleted notification from the current state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.NotificationID !== notificationId
        )
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification. Please try again.");
    }
  };

  return (
    <Box sx={{ px: { md: 0, sm: 3 }, maxWidth: 900, mx: "auto" }}>

      {/* --- Loading State --- */}
      {loading && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="250px"
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Fetching your updates...
          </Typography>
        </Box>
      )}

      {/* --- Error State --- */}
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 4, borderRadius: theme.shape.borderRadius }}>xxxxxxxx
            {error}
          </Alert>
        </Fade>
      )}

      {/* --- Empty State --- */}
      {!loading && !error && notifications.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            mt: 8,
            p: 5,
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius * 2,
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 60, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No New Notifications
          </Typography>
          <Typography variant="body1" color="text.disabled" sx={{ maxWidth: '70%', mx: 'auto' }}>
            It looks like your inbox is empty. We'll let you know when new updates arrive!
          </Typography>
        </Box>
      ) : (
        // --- Notifications List ---
        <Box>
          {notifications.map((notification) => (
            <NotificationItem key={notification.NotificationID} elevation={1}>
              {getNotificationIcon(notification.Type)} {/* Display icon based on type */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {new Date(notification.Created_At).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>
                  {notification.Message}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                  Category: {notification.Type}
                </Typography>
              </Box>
              {/* Delete Icon */}
              <IconButton
                aria-label="delete notification"
                onClick={() => handleDeleteNotification(notification.NotificationID)}
                sx={{ ml: 2, alignSelf: 'center' }} // Align vertically in the center
              >
                <DeleteOutlinedIcon color="action" />
              </IconButton>
            </NotificationItem>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NotificationPage;
