import React, { useState, useEffect } from "react";
import "../../../assets/style/global/login.css";
import logo from "../../../assets/Img/Group 2186.png";
import mtclogo from "../../../assets/Img/image 1.png";
import iphone from "../../../assets/Img/iphone-card-removebg-preview 1.png";
import login180 from "../../../assets/Img/MTC Vouchers_2017_53.34x9 1.png";
import login50 from "../../../assets/Img/MTC Vouchers_2017_53.34x9 3.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/reducers/authReducer.js";
import axiosInstance from "../../../utils/axiosInstance";

const Login = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loginError, setLoginError] = useState("");
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
    // if (!email) {
    //   setEmailError("Email is required");
    //   valid = false;
    // } else if (!/\S+@\S+\.\S+/.test(email)) {
    //   setEmailError("Email address is invalid");
    //   valid = false;
    // }

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

    setUsernameError("");
    setPasswordError("");

    if (validateForm()) {
      try {
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
        const refreshToken = response.headers["x-refresh-token"];
        const employee = response.data.employee;

        if (!token || !employee || !refreshToken) {
          throw new Error("Token or employee data is missing");
        }

        // Save rememberMe preference in localStorage
        localStorage.setItem("rememberMe", rememberMe);

        // Use localStorage or sessionStorage based on rememberMe
        if (rememberMe) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("refreshToken", refreshToken);
        } else {
          sessionStorage.setItem("accessToken", token);
          sessionStorage.setItem("refreshToken", refreshToken);
        }
        console.log("My employee: ", employee);
        dispatch(
          login({
            isAuthenticated: true,
            user: employee,
            role: employee.RoleID,
            token: token,
            refreshToken: refreshToken,
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
      }
    }
  };

  return (
    <div className="">
      <div className=" d-flex vh-100 w-100 ">
        <div className="d-none d-lg-block d-lg-flex col-lg-6 col-xl-7 justify-content-center align-items-center left-box">
          <img
            src={logo}
            alt="Illustration"
            className="img-fluid mtc-logo-login"
          />
        </div>
        <div className="m-auto col-11 col-md-10 col-lg-6 col-xl-5 d-flex flex-column justify-content-center align-items-center">
          <img
            src={mtclogo}
            alt="Illustration"
            className="img-fluid"
            style={{ width: 100, height: 100 }}
          />
          <div className="col-sm-3">
            <h4 className="text-header mb-3">Ambasphere</h4>
            {/* <h4 className="text-header mb-3">Ambasphere</h4> */}
          </div>

          <h6 className="fst-italic mb-3 text-center">
            Ambassador Handset & Airtime Benefits System
          </h6>

          <div className="col-12 col-sm-9 col-md-8 col-lg-10 position-relative p-sm-3 mt-3 mt-sm-3">
            <img
              src={login50}
              alt="Illustration"
              className="r150 behide-image img-fluid position-absolute d-none d-sm-block"
            />
            <img
              src={iphone}
              alt="Illustration"
              className="riphone behide-image img-fluid d-none d-sm-block"
            />
            <img
              src={login180}
              alt="Illustration"
              className="r180 behide-image img-fluid position-absolute d-none d-sm-block"
            />
            <div className="p-4 position-relative p-lg-4 p-xxl-5 rounded-3 bg-white shadow">
              <form onSubmit={handleSubmit}>
                <h3>Sign in to account</h3>
                <p className="pb-md-3">Enter your email & password to login</p>

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
                    value={username} // ✅ Ensure username persists
                    onChange={(e) => {
                      setUsernameError("");
                      setUsername(e.target.value);
                    }}
                  />
                  {usernameError && (
                    <p className="error mt-1">{usernameError}</p>
                  )}
                </div>

                <div
                  className={`form-group pb-3 position-relative ${
                    usernameError ? "error-class" : ""
                  }`}
                >
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
                  {passwordError && (
                    <p className="error mt-1">{passwordError}</p>
                  )}

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

                {/* ✅ Remember Me Checkbox */}
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
                  <label
                    className="form-check-label"
                    htmlFor="rememberPassword"
                  >
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
                  disabled={isCooldown}
                  onClick={() => {
                    let newCount;
                    if (!isCooldown) {
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
                      setLoginError("");
                    }
                  }}
                >
                  Sign in
                </button>
                {isCooldown && (
                  <p style={{ color: "red", textAlign: "center" }}>
                    Too many login attempts. Please wait 1 minute before trying
                    again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
