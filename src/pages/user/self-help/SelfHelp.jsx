import React from "react";
import ComingSoon from "../../../components/global/ComingSoon";
// Make sure this path exactly matches your folder structure!
import backgroundImage from "../../../assets/Img/landing/15248_MTC_Human Capital_Illustrations and Mock ups - Ambasphere Portal production-01.png";

const SelfHelp = () => {
  const containerStyle = {
    backgroundImage: `url('${backgroundImage}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    width: "100%",
    minHeight: "calc(100vh - 77px)",
  };

  return (
    <div className="container-main p-3" style={containerStyle}>
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <h2 className="text-white">Self Help</h2>
        <ComingSoon />
      </div>
    </div>
  );
};

export default SelfHelp;