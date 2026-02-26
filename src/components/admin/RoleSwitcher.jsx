import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { switchRole } from "../../store/reducers/authReducer";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const RoleSwitcher = ({title}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const handleSwitchRole = () => {
   console.log("Current user: ", currentUser);
   console.log("role: ", role);
    if (title === "User") {
      if (currentUser.RoleID === 9) {
        dispatch(switchRole(9));
      } else if (currentUser.RoleID === 10) {
        dispatch(switchRole(10));
      } else if (currentUser.RoleID === 11) {
        dispatch(switchRole(11));
      } else {
        dispatch(switchRole(3));
      }
      navigate(`/user/dashboard`, { replace: true });
    } else if (title === "Admin") {
      dispatch(switchRole(1));
      navigate(`/admin/dashboard`, { replace: true });
    }else if (title === "Finance") {
      dispatch(switchRole(9));
      navigate(`/finance/dashboard`, { replace: true });
    }else if (title === "Warehouse") {
      dispatch(switchRole(10));
      navigate(`/warehouse/dashboard`, { replace: true });
    }else if (title === "Retail") {
      dispatch(switchRole(11));
      navigate(`/retail/dashboard`, { replace: true });
    }
  };

  return (
    <div>
      
        <Button
          color="primary"
          onClick={handleSwitchRole}
          style={{
            fontSize: "14px",
            backgroundColor: "#0096D6",
            color: "#fff",
            padding: "8px",
            paddingLeft: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            borderColor: "#1A69AC",
            border: "1px solid",
          }}
        >
          Switch to {title}
        </Button>
      
      <Outlet />
    </div>
  );
};

export default RoleSwitcher;
