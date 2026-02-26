import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { ColorModeContext, useMode } from "./theme";
import { useDispatch, useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRoutes from "./routes/privateRoutes.js";
import { login } from "./store/reducers/authReducer.js";
import Topbar from "./components/global/Topbar";
import Sidebar from "./components/global/Sidebar.jsx";
import Login from "./pages/global/login/Login.jsx";
import Landing from "./pages/global/landing/Landing.jsx";
import Breadcrumb from "./components/global/Breadcrumb";
import Unauthorized from "./pages/global/Unauthorized.jsx";

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();
  const userRole = useSelector((state) => state.auth.role);
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname == "/";
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = JSON.parse(localStorage.getItem("user"));
      const role = JSON.parse(localStorage.getItem("role"));

      if (token) {
        dispatch(
          login({
            isAuthenticated: true,
            user: user || {},
            role: role || null,
            token,
            refreshToken,
          })
        );
      }
      setLoading(false); // Set loading to false after initialization
    };

    initializeAuth();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator
  }

  return (
    <ColorModeContext.Provider value={{ ...colorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {!isLandingPage && !isLoginPage && isAuthenticated && (
            <Sidebar
              openSidebarToggle={openSidebarToggle}
              OpenSidebar={OpenSidebar}
            />
          )}
          <main className="content">
            {!isLandingPage && !isLoginPage && isAuthenticated && (
              <Topbar OpenSidebar={OpenSidebar} />
            )}
            {!isLandingPage && !isLoginPage && isAuthenticated && (
              <Breadcrumb />
            )}
            <Routes>
              {/* Global Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              {PrivateRoutes()}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
