import React, { useState, useEffect } from "react";
import "../../../assets/style/global/login.css";
import heroBanner from "../../../assets/Img/landing/loginImage.png";
import mtclogo from "../../../assets/Img/landing/Ambasphere-Logo@2x.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/reducers/authReducer.js";
import axiosInstance from "../../../utils/axiosInstance";

const userFeatures = [
  {
    icon: <DashboardIcon />,
    title: "Dashboard",
    description:
      "See your handset and airtime benefits, renewal dates, and monthly allocations in one place.",
  },
  {
    icon: <DevicesOtherIcon />,
    title: "My Handsets",
    description:
      "Track device allocations and plan your next upgrade.",
  },
  {
    icon: <AssignmentIcon />,
    title: "My Benefits",
    description:
      "Manage airtime contracts and view package details securely.",
  },
  {
    icon: <AccountCircleIcon />,
    title: "Profile",
    description:
      "Review your ambassador details and keep your account information up to date.",
  },
  {
    icon: <HeadsetMicIcon />,
    title: "Support",
    description:
      "Reach the benefits team for help with contracts, devices, airtime, or account issues.",
  },
  {
    icon: <HelpOutlineIcon />,
    title: "Self-Help Hub",
    description:
      "Use benefit simulators to explore handset and airtime options before you apply.",
  },
];

const Login = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [count, setCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };
  useEffect(() => {
    const cooldownStart = localStorage.getItem("cooldownStart");
    if (cooldownStart) {
      const elapsed = Date.now() - parseInt(cooldownStart, 10);
      const remaining = 60000 - elapsed;

      if (remaining > 0) {
        setIsCooldown(true);
        setCooldownRemaining(remaining);
        const timeout = setTimeout(() => {
          setIsCooldown(false);
          setCount(0);
          localStorage.removeItem("cooldownStart");
        }, remaining);
        return () => clearTimeout(timeout);
      } else {
        localStorage.removeItem("cooldownStart");
        setCount(0);
      }
    }
  }, []);

  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    setRememberMe(savedRememberMe);

    if (savedRememberMe) {
      setUsername(localStorage.getItem("savedUsername") || "");
    }
  }, []);

  const validateForm = () => {
    let valid = true;
    if (!username) {
      setUsernameError("Username is required");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isCooldown) return;

    setUsernameError("");
    setPasswordError("");
    setLoginError("");

    if (!validateForm()) return;

    let newCount;
    if (username !== "" && password !== "") {
      newCount = count + 1;
      setCount(newCount);
    }
    if (newCount >= 6) {
      const now = Date.now();
      localStorage.setItem("cooldownStart", now.toString());
      setIsCooldown(true);
      setCooldownRemaining(60000);
      setTimeout(() => {
        setIsCooldown(false);
        setCount(0);
        localStorage.removeItem("cooldownStart");
      }, 60000);
    }

    try {
      setIsSubmitting(true);
        const response = await axiosInstance.post(
          "/auth/login",
          {
            Username: username,
            Password: password,
          },
          {
            customName: "frontend-app",
          }
        );

        const token =
          response.headers["authorization"] ||
          response.headers["Authorization"];
        const employee = response.data.employee;

        if (!token || !employee) {
          throw new Error("Token or employee data is missing");
        }

        // Save rememberMe preference in localStorage
        localStorage.setItem("rememberMe", rememberMe);

        // Use localStorage or sessionStorage based on rememberMe
        if (rememberMe) {
          localStorage.setItem("accessToken", token);
        } else {
          sessionStorage.setItem("accessToken", token);
        }
        dispatch(
          login({
            isAuthenticated: true,
            user: employee,
            role: employee.RoleID,
            token: token,
            rememberMe: rememberMe,
          })
        );

        // Ensure state update before navigation
        setTimeout(() => {
          if (employee.RoleID === 3) {
            navigate("/user/Dashboard");
          } else if (employee.RoleID === 9) {
            navigate("/finance/Dashboard")
          }
          else if (employee.RoleID === 10) {
            navigate("/warehouse/dashboard")
          }
          else if (employee.RoleID === 11) {
            navigate("/retail/dashboard")
          }
          else {
            navigate("/admin/Dashboard");
          }
        }, 0);
      } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        setLoginError("Password or Username is wrong");
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="login-page">
      <div className="login-layout d-flex min-vh-100 w-100">
        <aside className="d-none d-lg-flex col-lg-6 col-xl-7 login-hero-panel">
          <img
            src={heroBanner}
            alt=""
            aria-hidden="true"
            className="login-hero-image"
            fetchPriority="high"
            decoding="async"
          />
          <div className="login-hero-overlay" aria-hidden="true" />

          <div className="login-hero-content">
            <div className="login-hero-intro">
              <p className="login-hero-eyebrow mb-2">Ambassador portal</p>
              <h2 className="login-hero-title mb-3">
                Your handset &amp; airtime benefits, all in one place
              </h2>
              <p className="login-hero-lead mb-0">
                Sign in to manage your airtime and handset benefits.
              </p>
            </div>

            <ul className="login-feature-list list-unstyled mb-0">
              {userFeatures.map((feature, index) => (
                <li
                  key={feature.title}
                  className="login-feature-item"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <span className="login-feature-icon" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="login-feature-title">{feature.title}</h3>
                    <p className="login-feature-copy mb-0">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="m-auto col-11 col-md-9 col-lg-6 col-xl-5 d-flex flex-column justify-content-center align-items-center login-right-panel">
          <div className="col-12 login-form-shell">
            <div className="p-4 p-lg-4 p-xxl-5 rounded-3 bg-white shadow login-card">
              <div className="brand-block mb-4 text-center">
                <img
                  src={mtclogo}
                  alt="MTC logo"
                  className="img-fluid brand-logo"
                  decoding="async"
                  fetchPriority="high"
                />
                <h4 className="text-header mb-2">Ambasphere</h4>
                <p className="brand-tagline mb-0">
                  Ambassador Handset & Airtime Benefits System
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <h3 className="signin-title">Sign in to your account</h3>
                <p className="signin-copy pb-md-3">
                  Enter your username and password to continue.
                </p>

                <div className="form-group pb-3">
                  <label htmlFor="username" className="pb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="DoeJ"
                    autoComplete="off"
                    name="username"
                    value={username}
                    onChange={(e) => {
                      setUsernameError("");
                      setUsername(e.target.value);
                    }}
                  />
                  {usernameError && <p className="error mt-1">{usernameError}</p>}
                </div>

                <div className={`form-group pb-3 position-relative ${usernameError ? "error-class" : ""}`}>
                  <label htmlFor="password" className="pb-2">
                    Password
                  </label>
                  <input
                    type={passwordShown ? "text" : "password"}
                    className="form-control"
                    id="password"
                    placeholder="***************"
                    autoComplete="off"
                    name="password"
                    onChange={(e) => {
                      setPasswordError("");
                      setPassword(e.target.value);
                    }}
                  />
                  {passwordError && <p className="error mt-1">{passwordError}</p>}

                  <span
                    className={`${
                      passwordError
                        ? "show-password-top"
                        : "show-password mt-1 position-absolute translate-middle-y pr-4"
                    }`}
                    onClick={togglePassword}
                    style={{ cursor: "pointer" }}
                  >
                    {passwordShown ? "hide" : "show"}
                  </span>
                </div>

                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="submission"
                  disabled={isCooldown || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>

                {isCooldown && (
                  <p className="cooldown-text">
                    Too many login attempts. Please wait 1 minute before trying
                    again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
