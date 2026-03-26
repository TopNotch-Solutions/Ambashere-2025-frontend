import React, { useState, useEffect } from "react";
import "../../../assets/style/global/login.css";
import logo from "../../../assets/Img/Group 2186.png";
import mtclogo from "../../../assets/Img/image 1.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/reducers/authReducer.js";
import axiosInstance from "../../../utils/axiosInstance";

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
        console.log("My employee: ", employee);
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
        <aside className="d-none d-lg-flex col-lg-6 col-xl-7 left-box justify-content-center align-items-center">
          <div className="hero-content">
            <img src={logo} alt="Ambasphere visual" className="img-fluid mtc-logo-login" />
            <h2 className="hero-title mt-4 mb-3">Welcome to Ambasphere</h2>
            <p className="hero-subtitle mb-4">
              Securely access employee handset and airtime services from one
              digital platform.
            </p>
            <ul className="hero-points">
              <li>Manage claims and requests in one place</li>
              <li>Track approvals and submission progress</li>
              <li>Stay connected to HR support services</li>
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

                <div className="form-group form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberPassword"
                    checked={rememberMe}
                    onChange={() => {
                      setRememberMe(!rememberMe);
                      if (!rememberMe) {
                        localStorage.setItem("savedUsername", username);
                      } else {
                        localStorage.removeItem("savedUsername");
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="rememberPassword">
                    Remember Me
                  </label>
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
