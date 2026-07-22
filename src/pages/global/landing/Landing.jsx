import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LandingTopbar from "../../../components/global/LandingTopbar";
import "../../../assets/style/landing.css";
import heroBanner from "../../../assets/Img/landing/12859_MTC_Human-Capital_Resizing---Ambashphere-Portal-Images.jpg";
import img1 from "../../../assets/Img/landing/img-1@2x.png";
import img2 from "../../../assets/Img/landing/img-2@2x.png";
import img3 from "../../../assets/Img/landing/img-3@2x.png";
import img4 from "../../../assets/Img/landing/img-4@2x.png";
import img5 from "../../../assets/Img/landing/img-5@2x.png";
import img6 from "../../../assets/Img/landing/img-6@2x.png";
import img7 from "../../../assets/Img/landing/img-7@2x.png";
import img8 from "../../../assets/Img/landing/img-8@2x.png";
import logo from "../../../assets/Img/image 1.png";

const benefitCards = [
  {
    title: "Handset Benefits",
    description:
      "Manage your ambassador handset benefit securely.",
  },
  {
    title: "Airtime Benefits",
    description:
      "View airtime packages and manage your airtime benefits securely.",
  },
  {
    title: "Self-Help Tools",
    description:
      "Use benefit simulators to understand your handset and airtime options before you apply.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div>
      <LandingTopbar />

      <div className="carousel-wrapper">
        <div className="carousel-image-container">
          <img
            className="d-block w-100 carousel-image desktop-image"
            src={heroBanner}
            alt="Ambasphere desktop banner"
            fetchPriority="high"
            decoding="async"
          />
          <img
            className="d-block w-100 carousel-image mobile-image"
            src={heroBanner}
            alt="Ambasphere mobile banner"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="carousel-text-container text-dark pt-3">
          <h1 className="carousel-heading font-weight-bold mb-md-4">
            Handset & airtime <br /> benefits made simple
          </h1>
          <p className="landing-hero-copy mb-md-4">
            Ambasphere is MTC&apos;s secure platform for ambassador handset and
            airtime benefits. Manage your airtime and handset benefits from one place.
            
          </p>
          <div className="landing-sign-in-wrap">
            <Button
              className="landing-sign-in-btn"
              sx={{
                background:
                  "linear-gradient(to right, rgba(1,168,227,1), rgba(20,125,194,1))",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(to right, rgba(1,150,205,1), rgba(18,110,180,1))",
                },
              }}
              variant="contained"
              type="button"
              onClick={handleLoginRedirect}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="container d-flex flex-column mt-4 mt-md-5 mb-5">
        <div className="mb-4">
          <h1 className="fw-bold mb-md-3 mb-2">Your benefits portal</h1>
          <p className="text-muted mb-md-5">
            Everything you need for handset and airtime benefits — nothing else.
          </p>
          <div className="row g-4">
            {benefitCards.map((card) => (
              <div key={card.title} className="col-md-6 col-lg-3">
                <div className="border rounded h-100 d-flex flex-column p-3 p-md-4">
                  <h5 className="mb-2 mb-md-3">{card.title}</h5>
                  <p className="mb-4 flex-grow-1">{card.description}</p>
                  <button
                    type="button"
                    className="btn bg-danger text-white align-self-start"
                    onClick={handleLoginRedirect}
                  >
                    Sign in to access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-4 mt-md-5">Company Gallery</h3>
      </div>

      <div className="w-100 overflow-hidden mt-2 mt-md-5">
        <div className="row g-0 m-0">
          {[img1, img2, img3, img4].map((img, index) => (
            <div key={index} className="col-6 col-md-3 p-0">
              <img
                src={img}
                className="w-100 d-block"
                alt={`Gallery ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="row g-0 m-0">
          {[img5, img6, img7, img8].map((img, index) => (
            <div key={index} className="col-3  p-0">
              <img
                src={img}
                className="w-100 d-block"
                alt={`Gallery ${index + 5}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      <footer>
        <div
          className="row m-0 text-white"
          style={{ backgroundColor: "#515151" }}
        >
          <div className="col mt-4 ms-2 ms-md-5">
            <p>© 2026 Ambasphere-MTC</p>
          </div>
          <div className="col mt-2 mt-md-4 d-flex flex-inline justify-content-end me-2 me-md-5">
            <p style={{ fontSize: "12px", marginTop: "10px" }}>
              a digital innovation by
            </p>
            <img className="responsive-logo" src={logo} alt="MTC logo" loading="lazy" decoding="async" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
