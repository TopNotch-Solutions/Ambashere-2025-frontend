import React from "react";
import { Box, Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import { useSelector, useDispatch } from "react-redux";

const Breadcrumb = () => {
  const location = useLocation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { role } = useSelector((state) => state.auth);

  // Split the pathname into parts and remove 'admin' or 'user' if present
  const pathParts = location.pathname
    .split("/")
    .filter((part) => part !== "" && part !== "admin" && part !== "user");

  // Generate breadcrumb links
  const breadcrumbLinks = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join("/")}`;
    return (
      <Link
        key={index}
        component={RouterLink}
        to={url}
        underline="hover"
        color="primary"
      >
        {part.charAt(0).toUpperCase() + part.slice(1)}
      </Link>
    );
  });

  // If current location is login page, return null to hide breadcrumb
  if (location.pathname === "/") {
    return null;
  }

  // Special case for the /Dashboard page to show only "Home" instead of "Home > Dashboard"
  if (
    location.pathname === "/admin/Dashboard" ||
    location.pathname === "/user/Dashboard"
  ) {
    return (
      <Box m={2}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ color: colors.primary }}
        >
          <Link
            component={RouterLink}
            to={location.pathname}
            underline="hover"
            color="primary"
          >
            Home
          </Link>
        </Breadcrumbs>
      </Box>
    );
  }

  return (
    <Box m={2}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ color: colors.primary }}
      >
        {role === 3 && (
          <Link component={RouterLink} to="/user/Dashboard" underline="hover" color="primary">
            Home
          </Link>
        )}
        {role === 1 && (
          <Link component={RouterLink} to="/admin/Dashboard" underline="hover" color="primary">
            Home
          </Link>
        )}
        {breadcrumbLinks}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
