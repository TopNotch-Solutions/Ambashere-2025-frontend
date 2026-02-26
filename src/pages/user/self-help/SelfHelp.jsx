import React, { useEffect, useState } from "react";
import ComingSoon from "../../../components/global/ComingSoon";

const SelfHelp = () => {
  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <h2>Self Help</h2>
        <ComingSoon />
      </div>
    </div>
  );
};

export default SelfHelp;
