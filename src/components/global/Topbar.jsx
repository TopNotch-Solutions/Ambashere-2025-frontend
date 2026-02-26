import React, { useEffect, useState } from "react";
import { Box, IconButton, useTheme, Avatar, Badge } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import logo from "../../assets/Img/image 1.png";
import Dropdown from "react-bootstrap/Dropdown";
import { BsPersonGear, BsGear, BsBoxArrowRight } from "react-icons/bs";
import { useSelector } from "react-redux";
import NotificationDropdown from "./NotificationDropdown";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Topbar = ({ profilePicture, OpenSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { role } = useSelector((state) => state.auth);
  let profileImage = currentUser?.ProfileImage
    ? JSON.parse(currentUser.ProfileImage).ProfileImage
    : null;
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (!currentUser?.EmployeeCode) return;

        const response = await axiosInstance.get(
          `/notifications/admin-notification`
        );
        console.log("The notification count: ", response.data.count);
        if (response.status === 200) {
          setNotificationCount(response.data.count);
        } else {
          console.error("Failed to fetch notification count:", response);
        }
      } catch (error) {
        console.error("Notification count error:", error.message);
      }
    };

    fetchNotificationCount();
  }, [currentUser?.EmployeeCode]);

  const roleNotifications = notifications.filter((notification) =>
    role === 1 ? notification.type === "1" : notification.type === "3"
  );
  const hasNotifications = roleNotifications.length > 0;

  const [showDropdown, setShowDropdown] = useState(false);

  if (!currentUser || !currentUser.FullName) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={4}
      position="relative"
      sx={{
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "white",
        padding: "1rem 1.5rem",
      }}
    >
      {/* LOGO*/}
      <div className="d-none d-lg-block">
        <Box display="flex" borderRadius="3px" height={"45px"}>
          <img rounded-full w-8 h-8 src={logo} alt="user-profile" />
        </Box>
      </div>
      <div className="d-block d-lg-none" style={{ cursor: "pointer" }}>
        <MenuIcon style={{ fontSize: "1.8rem" }} onClick={OpenSidebar} />
      </div>

      {/* ICONS & SEARCH BAR  */}
      <Box display="flex" alignItems="center">
  {/* Notifications */}
  
  <Dropdown>
      <Dropdown.Toggle
        as="div"
        style={{
          cursor: "pointer",
          marginTop: "9px",
          display: "flex",
          position: "relative",
        }}
      >
        <Badge badgeContent={notificationCount} max={99} color="error">
          <NotificationsOutlinedIcon />
        </Badge>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <NotificationDropdown />
      </Dropdown.Menu>
    </Dropdown>


  {/* Name */}
  <div style={{ display: "flex", alignItems: "center", padding: "6px" }}>
    {currentUser?.FullName?.length <= 14
      ? currentUser?.FullName
      : currentUser?.LastName || ""}
  </div>

  {/* Avatar */}
  <Avatar alt="User Profile" src={profileImage} />

  {/* Profile Dropdown */}
  <Dropdown className="dropdown" autoClose="outside">
    <Dropdown.Toggle variant="" id="dropdown-basic"></Dropdown.Toggle>
    <Dropdown.Menu className="dropdown-menu">
      <Dropdown.Item href={currentUser.RoleID !== 1 ? "/user/profile":"/admin/profile"}>
        <BsPersonGear style={{ marginRight: "10px" }} />
        Profile
      </Dropdown.Item>
      <Dropdown.Item href="/">
        <BsBoxArrowRight style={{ marginRight: "10px" }} />
        Logout
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
</Box>

    </Box>
  );
};

export default Topbar;
