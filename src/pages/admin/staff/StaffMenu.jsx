import React from "react";

const StaffMenu = ({ selectedTab, onTabChange }) => {
  return (
    <div className="mb-4" style={{ display: "flex", gap: "50px" }}>
      <span
        className="col-sm-2 rounded-2 p-3 align-items-center text-center"
        onClick={() => onTabChange("personal")}
        style={{
          cursor: "pointer",
          // textDecoration: selectedTab === "personal" ? "color" : "black",
          backgroundColor: selectedTab === "personal" ? "#0096D6" : "#EEEEEE",
          color: selectedTab === "personal" ? "white" : "black",
          fontWeight: selectedTab === "personal" ? "bold" : "normal",
          boxShadow: selectedTab === "personal" ? "0 0 15px #0096D6" : "none",
        }}
      >
        Personal
      </span>

      <span
        className="col-sm-2 rounded-2 p-3 align-items-center text-center"
        onClick={() => onTabChange("airtimeBenefits")}
        style={{
          cursor: "pointer",
          // textDecoration:
          //   selectedTab === "airtimeBenefits" ? "underline" : "none",
          backgroundColor:
            selectedTab === "airtimeBenefits" ? "#0096D6" : "#EEEEEE",
          color: selectedTab === "airtimeBenefits" ? "white" : "black",
          fontWeight: selectedTab === "airtimeBenefits" ? "bold" : "normal",
          boxShadow:
            selectedTab === "airtimeBenefits" ? "0 0 15px #0096D6" : "none",
        }}
      >
        Airtime Benefits
      </span>

      <span
        className="col-sm-2 rounded-2 p-3 align-items-center text-center"
        onClick={() => onTabChange("handsetBenefits")}
        style={{
          cursor: "pointer",
          // textDecoration:
          //   selectedTab === "handsetBenefits" ? "underline" : "none",
          backgroundColor:
            selectedTab === "handsetBenefits" ? "#0096D6" : "#EEEEEE",
          color: selectedTab === "handsetBenefits" ? "white" : "black",
          fontWeight: selectedTab === "handsetBenefits" ? "bold" : "normal",
          boxShadow:
            selectedTab === "handsetBenefits" ? "0 0 15px #0096D6" : "none",
        }}
      >
        Handset Benefits
      </span>

      {/* <span
        className="col-sm-2 rounded-2 p-3 align-items-center text-center"
        onClick={() => onTabChange("currentPlans")}
        style={{
          cursor: "pointer",
          // textDecoration: selectedTab === "currentPlans" ? "underline" : "none",
          backgroundColor:
            selectedTab === "currentPlans" ? "#0096D6" : "#EEEEEE",
          color: selectedTab === "currentPlans" ? "white" : "black",
          fontWeight: selectedTab === "currentPlans" ? "bold" : "normal",
          boxShadow:
            selectedTab === "currentPlans" ? "0 0 15px #0096D6" : "none",
        }}
      >
        Current Plans
      </span>
      <div style={{ borderBottom: "2px solid black", marginTop: "5px" }}></div> */}
    </div>
  );
};

export default StaffMenu;
