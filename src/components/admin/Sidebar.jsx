import React, { useState } from "react";
import {
  BsHddStackFill,
  BsPhone,
  BsGraphUpArrow,
  BsPeople,
  BsCalendar3Week,
  BsBoxes,
  BsPerson,
  BsUpload,
  BsColumnsGap,
  BsBoxArrowRight,
} from "react-icons/bs";
import { RiFilePaper2Line } from "react-icons/ri";
import { NavLink } from "react-router-dom";
// import { useWindowDimensions } from "../../hooks/useWindowDimensions";

const Sidebar = ({ children }) => {
  // const height = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const menuItem = [
    {
      path: "/Dashboard",
      name: "Dashboard",
      icon: <BsColumnsGap size={22} />,
    },
    {
      path: "/Upload",
      name: "Upload Files",
      icon: <BsUpload size={22} />,
    },
    {
      path: "/Employees",
      name: "Employees",
      icon: <BsPeople size={22} />,
    },
    {
      path: "/Handsets",
      name: "Staff Handsets",
      icon: <BsPhone size={22} />,
    },
    {
      path: "/Contracts",
      name: "Contracts",
      icon: <RiFilePaper2Line size={22} />,
    },
    {
      path: "/Reports",
      name: "Reports",
      icon: <BsGraphUpArrow size={22} />,
    },
    {
      path: "/Calendar",
      name: "Calendar",
      icon: <BsCalendar3Week size={22} />,
    },
    {
      path: "/Voucher",
      name: "Voucher",
      icon: <BsGraphUpArrow size={22} />,
    },
    // {
    //   path: "/Profile",
    //   name: "Profile",
    //   icon: <FaUser size={22} />,
    // },
    // {
    //   path: "/Settings",
    //   name: "Settings",
    //   icon: <FaCog size={22} />,
    // },
    // {
    //   path: "/",
    //   name: "Logout",
    //   icon: <ImExit size={22} />,
    // },
  ];

  const sidebarWidthOpen = isOpen ? "205px" : "60px";
  const sidebarMarginOpen = isOpen ? "150px" : "17px";
  return (
    <div
      className=""
      
    >
      <div className="sidebar" style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: sidebarWidthOpen,
        height: "100vh"
      }}>
        <div className="top_section">
          <div
            style={{ marginLeft: sidebarMarginOpen, fontSize: "60px" }}
            className="bars"
          >
            <BsHddStackFill onClick={toggle} size={25} />
          </div>
        </div>
        {menuItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link"
            activeclassName="active"
          >
            <div className="icon">{item.icon}</div>
            <div
              style={{ display: isOpen ? "block" : "none" }}
              className="link_text"
            >
              {item.name}
            </div>
          </NavLink>
        ))}
        {/* <div className="bottom_section">
          <FaDoorOpen size={25}/>
          <p>Logout</p>
        </div> */}
      </div>
      <main
        style={{
          marginLeft: sidebarWidthOpen,
          overflowX: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
