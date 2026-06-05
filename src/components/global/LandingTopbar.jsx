import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../assets/Img/landing/Ambasphere-Logo@2x.png";
import { Link } from "react-router-dom";

const LandingTopbar = () => {
  return (
    <Navbar variant="dark" expand="lg" className="py-2 px-3">
      <Navbar.Brand as={Link} to="/">
        <img
          src={logo}
          alt="Ambasphere Logo"
          style={{ width: "35px", height: "auto" }}
        />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="navbar-nav" />

      <Navbar.Collapse className="justify-content-end" id="navbar-nav">
        <Nav className="ml-auto">
          {/* <Nav.Link as={Link} to="/" className="text-black fw-bold">
            HOME
          </Nav.Link> */}
          <Nav.Link as={Link} to="/login" className="text-black fw-bold">
            SIGN IN
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default LandingTopbar;
