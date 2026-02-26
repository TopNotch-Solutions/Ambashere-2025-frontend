import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../assets/Img/landing/Ambasphere-Logo@2x.png";
import { Container } from "react-bootstrap";

const LandingTopbar = () => {
  return (
    <Navbar
      variant="dark"
      expand="lg"
      className="py-2 px-3"
    >
      {/* LOGO */}
      <Navbar.Brand href="/">
        <img
          src={logo}
          alt="Ambasphere Logo"
          style={{ width: "35px", height: "auto" }}
        />
      </Navbar.Brand>

      {/* TOGGLE FOR MOBILE */}
      <Navbar.Toggle aria-controls="navbar-nav" />

      <Navbar.Collapse className="justify-content-end me-5" id="navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link href="/" className="text-black fw-bold">
            HOME
          </Nav.Link>
          <Nav.Link href="/#" className="text-black fw-bold">
            HUMAN RESOURCES
          </Nav.Link>
          <Nav.Link href="/#" className="text-black fw-bold">
            TIPS
          </Nav.Link>
          <Nav.Link href="/#" className="text-black fw-bold">
            CONTACT
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default LandingTopbar;
