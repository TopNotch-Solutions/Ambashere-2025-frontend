import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children }) => {
  return (
    <>
      <Sidebar />
      <Topbar />
      {children}
    </>
  );
};

export default Layout;
