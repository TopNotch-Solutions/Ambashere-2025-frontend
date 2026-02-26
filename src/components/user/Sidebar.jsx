import React, { useState } from "react";
import {
  FaLayerGroup,
} from "react-icons/fa";
import { BsHddStackFill , BsPhone, BsGraphUpArrow, BsCalendar3Week, BsBoxes, BsHeadset  } from "react-icons/bs";
import { ImExit } from "react-icons/im";
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
      icon: <FaLayerGroup size={22} />,
    },
    // {
    //   path: "/Category",
    //   name: "Category",
    //   icon: <FaBriefcase size={22} />,
    // },
    {
      path: "/Handsets",
      name: "Handsets",
      icon: <BsPhone size={22} />,
    },
    {
      path: "/Packages",
      name: "Packages",
      icon: <BsBoxes size={22} />,
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
      path: "/Support",
      name: "Support",
      icon: <BsHeadset  size={22} />,
    },
  ];
  
  return (
    <div className="" >
      <div
        style={{ width: isOpen ? "205px" : "60px", height: "100%" }}
        className="sidebar"
      >
        <div className="top_section">
          <div
            style={{ marginLeft: isOpen ? "150px" : "0px", fontSize: "60px" }}
            className="bars"
          >
            <BsHddStackFill  color = "white" onClick={toggle} size={25} />
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
      <main>{children}</main>
    </div>
  );
};

export default Sidebar;
