import "../../../assets/style/global/settings.css";
import { Switch } from "@mui/material";
import React, { useState } from "react";

const AdminSettings = () => {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [pushNotification, setPushNotification] = useState(false);
  const [mobileNotification, setMobileNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);

  const handleTwoFactorAuth = (event) => {
    setTwoFactorAuth(event.target.checked);
  };
  const handlePushNotification = (event) => {
    setPushNotification(event.target.checked);
  };
  const handleMobileNotification = (event) => {
    setMobileNotification(event.target.checked);
  };
  const handleEmailNotification = (event) => {
    setEmailNotification(event.target.checked);
  };
  return (
    <div className="main-container rounded border m-4 p-3 p-sm-4">
      <div className="border-bottom ">
        <p className="fw-bold">Two-factor Authentication</p>
        <div className="d-flex justify-content-between align-items-center mb-3 mb-sm-5 classical">
          <p className="my-auto mr-2 text-lightt">
            Keep your account secure by enabling 2FA via email
          </p>
          <Switch
            checked={twoFactorAuth}
            onChange={handleTwoFactorAuth}
            inputProps={{ "aria-label": "controlled" }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#52d869",
                "&:hover": {
                  backgroundColor: "rgba(82, 216, 105, 0.08)",
                },
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "rgba(52, 199, 89, 1)", // Color of the track when checked
              },
            }}
          />
        </div>
      </div>
      <div className="border-bottom mt-4">
        <p className="fw-bold">Mobile Push Notifications</p>
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-5">
          <p className="text-lightt">Receive push Notifications</p>
          <Switch
            checked={pushNotification}
            onChange={handlePushNotification}
            inputProps={{ "aria-label": "controlled" }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#52d869",
                "&:hover": {
                  backgroundColor: "rgba(82, 216, 105, 0.08)",
                },
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "rgba(52, 199, 89, 1)", // Color of the track when checked
              },
            }}
          />
        </div>
      </div>
      <div className="border-bottom mt-4">
        <p className="fw-bold">Desktop Notification</p>
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-5">
          <p className="text-lightt">Receive push notification in desktop</p>
          <Switch
            checked={mobileNotification}
            onChange={handleMobileNotification}
            inputProps={{ "aria-label": "controlled" }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#52d869",
                "&:hover": {
                  backgroundColor: "rgba(82, 216, 105, 0.08)",
                },
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "rgba(52, 199, 89, 1)", // Color of the track when checked
              },
            }}
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="fw-bold">Email Notifications</p>
        <div className="d-flex justify-content-between align-items-center line-done">
          <p className="text-lightt">Receive email notification</p>
          <Switch
            checked={emailNotification}
            onChange={handleEmailNotification}
            inputProps={{ "aria-label": "controlled" }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#52d869",
                "&:hover": {
                  backgroundColor: "rgba(82, 216, 105, 0.08)",
                },
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "rgba(52, 199, 89, 1)", // Color of the track when checked
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;