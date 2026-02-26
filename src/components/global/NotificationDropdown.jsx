import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import { markNotificationRead as markAsRead } from "../../store/actions/notificationActions";
import "../../assets/style/global/notification.css";
import socket from "../../utils/socket";
import axiosInstance from "../../utils/axiosInstance";

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const { role } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Listen for incoming notifications
    socket.on("notification", (data) => {
      // console.log('Received notification:', data);
      dispatch({ type: "ADD_NOTIFICATION", payload: data });
    });

    // Clean up the connection on component unmount
    return () => {
      socket.off("notification"); // Remove specific event listener
    };
  }, [dispatch]);

  const handleMarkAsRead = (NotificationID) => {
    // Dispatch action to mark notification as read
    dispatch(markAsRead(NotificationID));
  
    // Make API call to mark notification as read on the server
    axiosInstance
      .put(`/notifications/${NotificationID}/markAsRead`)
      .then((response) => {
        console.log('Notification marked as read:', response.data);
      })
      .catch((error) => {
        console.error("Failed to mark notification as read", error);
      });
  };
  

  const handleShowAllClick = () => {
    // Navigate to notifications page
    navigate("/notifications");
  };

  // Filter notifications based on role or specific identifiers
  const filteredNotifications = notifications.filter((notification) => {
    if (role === 1) {
      // Example: Filter notifications for admins
      return notification.Type === "Admin Notification";
    } else if (role === 8) {
      // Filter notifications for temporary users
      return (
        (notification.Type === "User Notification" || notification.Type === "Temporary Staff Notification") &&
        notification.EmployeeCode === currentUser.EmployeeCode
      );
    } else {
      // Example: Filter notifications for regular users
      return (
        notification.Type === "User Notification" &&
        notification.EmployeeCode === currentUser.EmployeeCode
      );
    }
  });

  return (
    <div className=" justify-content-between p-3">
      {filteredNotifications.slice(0, 5).map((notification) => (
        <Dropdown.Item
          key={notification.NotificationID}
          className="notification-item row"
        >
          <div className="col">
            <span
              className="notification-message"
              style={{ 
                color: notification.Viewed ? "black" : "blue", 
                fontSize: "14px",
                fontWeight: notification.Viewed ? "normal" : "bold"
              }}
            >
              {notification.Message}
            </span>
            {notification.Type === "Temporary Staff Notification" && (
              <span 
                style={{ 
                  fontSize: "10px", 
                  color: "#ffc107", 
                  marginLeft: "5px",
                  fontWeight: "bold"
                }}
              >
                [TEMP]
              </span>
            )}
          </div>
          <div className="col-sm-3">
            {/* {!notification.Viewed && (
              <button
              variant="primary"
                onClick={() => handleMarkAsRead(notification.NotificationID)}
              >
                Mark as read
              </button>
            )} */}
          </div>
        </Dropdown.Item>
      ))}
      <Dropdown.Item onClick={handleShowAllClick}>Show All</Dropdown.Item>
    </div>
  );
};

export default NotificationDropdown;
