import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import backgroundImage from "../../../assets/Img/landing/15248_MTC_Human Capital_Illustrations and Mock ups - Ambasphere Portal production-01.png";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/notification.css";

const getNotificationIcon = (type) => {
  const iconClass = "notification-card-icon";
  switch (type?.toLowerCase()) {
    case "info":
      return <InfoOutlinedIcon className={iconClass} />;
    case "warning":
      return (
        <WarningAmberOutlinedIcon
          className={`${iconClass} notification-card-icon--warning`}
        />
      );
    case "success":
      return (
        <CheckCircleOutlineOutlinedIcon
          className={`${iconClass} notification-card-icon--success`}
        />
      );
    default:
      return <NotificationsNoneOutlinedIcon className={iconClass} />;
  }
};

const getCardModifier = (type) => {
  switch (type?.toLowerCase()) {
    case "warning":
      return "notification-card--warning";
    case "success":
      return "notification-card--success";
    default:
      return "";
  }
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [shouldReFetch, setShouldReFetch] = useState(true);

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/notifications`);
        const fetchedNotifications = response.data;

        setNotifications(fetchedNotifications);

        if (fetchedNotifications.length > 0) {
          try {
            await axiosInstance.put(`/notifications`);
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
      setShouldReFetch(false);
    }
  }, [shouldReFetch]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
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

  const handleDeleteAllNotifications = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          axiosInstance.delete(`/notifications/${n.NotificationID}`)
        )
      );
      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      setError("Failed to clear notifications. Please try again.");
    }
  };

  const containerStyle = {
    backgroundImage: `url('${backgroundImage}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    width: "100%",
    minHeight: "calc(100vh - 77px)",
  };

  return (
    <div className="container-main p-3" style={containerStyle}>
      <Box
        className="handset-simulator-page notification-modern-page"
        sx={{ px: { md: 0, sm: 3 }, maxWidth: 980, mx: "auto" }}
      >
        <div className="handset-hero mb-4">
          <div>
            <h2 className="handset-title">Notifications</h2>
            <p className="handset-subtitle mb-0">
              Stay up to date with alerts and important system updates.
            </p>
          </div>
        </div>

        {!loading && !error && notifications.length > 0 && (
          <Box className="notification-toolbar mb-3">
            <Chip
              className="notification-count-chip"
              label={`${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
              variant="outlined"
            />
            <Box className="notification-toolbar-actions">
              <Button
                className="notification-read-btn"
                startIcon={<MarkEmailReadOutlinedIcon />}
              >
                Marked as read
              </Button>
              <Button
                className="notification-danger-btn"
                startIcon={<DeleteSweepOutlinedIcon />}
                onClick={handleDeleteAllNotifications}
              >
                Clear all
              </Button>
            </Box>
          </Box>
        )}

        {loading && (
          <Box className="notification-state-panel notification-state-panel--loading">
            <CircularProgress className="notification-progress" size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" className="notification-loading-text">
              Fetching your updates...
            </Typography>
          </Box>
        )}

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" className="notification-error-alert" sx={{ mb: 4 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {!loading && !error && notifications.length === 0 ? (
          <Box className="notification-state-panel">
            <NotificationsNoneOutlinedIcon className="notification-state-icon" />
            <Typography variant="h5" className="notification-state-title" gutterBottom>
              No New Notifications
            </Typography>
            <Typography variant="body1" className="notification-state-text">
              It looks like your inbox is empty. We&apos;ll let you know when new updates arrive!
            </Typography>
          </Box>
        ) : (
          !loading &&
          !error && (
            <Box className="notification-list-wrap">
              {notifications.map((notification) => (
                <div
                  key={notification.NotificationID}
                  className={`notification-card ${getCardModifier(notification.Type)}`}
                >
                  {getNotificationIcon(notification.Type)}
                  <div className="notification-card-body">
                    <div className="notification-date">
                      {new Date(notification.Created_At).toLocaleString()}
                    </div>
                    <div className="notification-message">{notification.Message}</div>
                    <span className="notification-category">{notification.Type}</span>
                  </div>
                  <IconButton
                    aria-label="delete notification"
                    className="notification-delete-btn"
                    onClick={() => handleDeleteNotification(notification.NotificationID)}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </Box>
          )
        )}
      </Box>
    </div>
  );
};

export default NotificationPage;
