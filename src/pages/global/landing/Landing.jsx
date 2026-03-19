import { Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LandingTopbar from "../../../components/global/LandingTopbar";
import Carousel from "react-bootstrap/Carousel";
import Image from "react-bootstrap/Image";
import "../../../assets/style/landing.css";
import Img from "../../../assets/Img/landing/portal-cover-image.jpg";
import Img2 from "../../../assets/Img/landing/11960-Ambasphere-Hero-Banner-V2.png";
import logo1 from "../../../assets/Img/landing/Compensation.png";
import logo3 from "../../../assets/Img/landing/Culture.png";
import logo4 from "../../../assets/Img/landing/Growth.png";
import logo5 from "../../../assets/Img/landing/Wellbeing.png";
import galleryImage from "../../../assets/Img/landing/11960-Ambasphere-Gallery-Banner.png";
import logo from "../../../assets/Img/image 1.png";
import img1 from "../../../assets/Img/landing/img-1@2x.png";
import img2 from "../../../assets/Img/landing/img-2@2x.png";
import img3 from "../../../assets/Img/landing/img-3@2x.png";
import img4 from "../../../assets/Img/landing/img-4@2x.png";
import img5 from "../../../assets/Img/landing/img-5@2x.png";
import img6 from "../../../assets/Img/landing/img-6@2x.png";
import img7 from "../../../assets/Img/landing/img-7@2x.png";
import img8 from "../../../assets/Img/landing/img-8@2x.png";

const Landing = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

  return (
    <div>
      {/* Top  Bar */}
      <LandingTopbar />

      {/* Carousel */}
      <div className="carousel-wrapper">
  <div className="carousel-image-container">
    <img className="d-block w-100 carousel-image desktop-image" src={Img} alt="Desktop banner" />

{/* Mobile image */}
<img className="d-block w-100 carousel-image mobile-image" src={Img2} alt="Mobile banner" />
  </div>
  <div className="carousel-text-container text-dark pt-3">
    <h1 className="carousel-heading font-weight-bold mb-md-4">
      Your experience <br /> begins with you
    </h1>
    <p className="mb-md-4">
      Access the employee self-service portal for leave requests, <br />
      overtime submissions, and profile updates from one place. <br />
      Stay connected to company resources and complete HR tasks <br />
      quickly with a secure and simple digital workflow.
    </p>
    <Button
        sx={{
    background: 'linear-gradient(to right, rgba(1,168,227,1), rgba(20,125,194,1))',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(to right, rgba(1,150,205,1), rgba(18,110,180,1))',
    },
  }}
      variant="contained"
      type="submit"
      onClick={handleLoginRedirect}
    >
      Find Out More
    </Button>
  </div>
</div>


      <div className="container d-flex flex-column mt-4 mt-md-5">
        {/* Top Half */}
        <div className="mb-4">
          <h1 className="fw-bold mb-md-5 mb-2">Make it count</h1>
          <div className="row g-4">
            {/* Leave Application Form */}
            <div className="col-md-4 col-sm-6 ">
              <div className="col d-flex align-items-center justify-content-between border rounded p-2">
                <p className="ms-2 mt-3">Download leave application form</p>
                <svg
                  className="ms-3"
                  width="40"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#fa0000"
                  strokeWidth="0.24"
                >
                  <path
                    opacity="0.5"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z"
                    fill="#ff0000"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 16.75C12.2106 16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726 10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353 11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886 16.6615 11.7894 16.75 12 16.75Z"
                    fill="#ff0000"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="col d-flex align-items-center justify-content-between  border rounded p-2">
                <p className="ms-2 mt-3">Download over-time forms</p>
                <svg
                  className="ms-3"
                  width="40px"
                  height="28px"
                  viewBox="0 0 24.00 24.00"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#fa0000"
                  stroke-width="0.00024000000000000003"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      opacity="0.5"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z"
                      fill="#ff0000"
                    ></path>{" "}
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 16.75C12.2106 16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726 10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353 11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886 16.6615 11.7894 16.75 12 16.75Z"
                      fill="#ff0000"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="col d-flex align-items-center justify-content-between  border rounded p-2">
                <p className="ms-2 mt-3">Download company directory forms</p>
                <svg
                  className="ms-3"
                  width="40px"
                  height="28px"
                  viewBox="0 0 24.00 24.00"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#fa0000"
                  stroke-width="0.00024000000000000003"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      opacity="0.5"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z"
                      fill="#ff0000"
                    ></path>{" "}
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 16.75C12.2106 16.75 12.4114 16.6615 12.5535 16.5061L16.5535 12.1311C16.833 11.8254 16.8118 11.351 16.5061 11.0715C16.2004 10.792 15.726 10.8132 15.4465 11.1189L12.75 14.0682V3C12.75 2.58579 12.4142 2.25 12 2.25C11.5858 2.25 11.25 2.58579 11.25 3V14.0682L8.55353 11.1189C8.27403 10.8132 7.79963 10.792 7.49393 11.0715C7.18823 11.351 7.16698 11.8254 7.44648 12.1311L11.4465 16.5061C11.5886 16.6615 11.7894 16.75 12 16.75Z"
                      fill="#ff0000"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="col d-flex align-items-center justify-content-between  border rounded p-2">
                <p className="ms-2 mt-3">View my profile</p>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                  className="ms-3"
                  width="40px"
                  height="28px"
                  stroke-width="0.00024000000000000003"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7.07 18.28C7.5 17.38 10.12 16.5 12 16.5C13.88 16.5 16.51 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20C10.14 20 8.43 19.36 7.07 18.28ZM12 14.5C13.46 14.5 16.93 15.09 18.36 16.83C19.38 15.49 20 13.82 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12C4 13.82 4.62 15.49 5.64 16.83C7.07 15.09 10.54 14.5 12 14.5ZM12 6C10.06 6 8.5 7.56 8.5 9.5C8.5 11.44 10.06 13 12 13C13.94 13 15.5 11.44 15.5 9.5C15.5 7.56 13.94 6 12 6ZM10.5 9.5C10.5 10.33 11.17 11 12 11C12.83 11 13.5 10.33 13.5 9.5C13.5 8.67 12.83 8 12 8C11.17 8 10.5 8.67 10.5 9.5Z"
                      fill="#ff0000"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="col d-flex align-items-center justify-content-between  border rounded p-2">
                <p className="ms-2 mt-3">Leave day balance</p>
                <svg
                  className="ms-3"
                  width="40px"
                  height="28px"
                  fill="#ff0000"
                  viewBox="0 0 512 512"
                  enable-background="new 0 0 512 512"
                  id="chair_x5F_umbrella"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ff0000"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <g>
                      {" "}
                      <path d="M474.407,170.574c-0.449-1.188-0.912-2.368-1.389-3.541c-0.119-0.292-0.246-0.579-0.366-0.87 c-0.363-0.877-0.725-1.754-1.104-2.622c-0.293-0.674-0.6-1.339-0.902-2.007c-0.216-0.479-0.425-0.961-0.646-1.437 c-0.303-0.654-0.621-1.3-0.934-1.949c-0.232-0.481-0.457-0.968-0.694-1.447c-0.362-0.732-0.738-1.455-1.112-2.181 c-0.198-0.387-0.391-0.778-0.593-1.163c-0.419-0.797-0.852-1.585-1.284-2.373c-0.167-0.307-0.328-0.616-0.498-0.921 c-0.466-0.837-0.946-1.664-1.428-2.49c-0.145-0.249-0.283-0.503-0.43-0.751c-0.581-0.984-1.175-1.96-1.776-2.93 c-0.053-0.084-0.103-0.172-0.155-0.256c-0.614-0.986-1.242-1.962-1.878-2.933c-0.044-0.066-0.086-0.135-0.129-0.202 c-0.562-0.853-1.137-1.695-1.715-2.536c-0.124-0.181-0.243-0.365-0.367-0.544c-0.594-0.856-1.201-1.703-1.813-2.546 c-0.114-0.158-0.224-0.319-0.339-0.477c-0.729-0.996-1.469-1.983-2.221-2.961c0,0,0,0-0.001-0.001 c-0.741-0.964-1.494-1.918-2.258-2.862c-0.012-0.015-0.023-0.03-0.035-0.045c-0.761-0.939-1.532-1.869-2.314-2.79 c-0.017-0.019-0.032-0.038-0.048-0.058c-13.045-15.335-29.131-27.977-47.551-37.216l3.092-6.744 c1.491-3.25,0.063-7.093-3.188-8.582c-3.248-1.49-7.092-0.064-8.582,3.188l-3.123,6.813 c-35.482-14.248-74.438-14.676-110.421-1.066c-38.021,14.383-68.167,42.713-84.882,79.771c-1.471,3.259-0.021,7.093,3.239,8.563 l126.013,56.842l-36.287,79.172H180.994l-27.631-54.71c-1.102-2.182-3.336-3.556-5.778-3.556H108.03 c-2.235,0-4.313,1.153-5.495,3.051c-1.183,1.898-1.301,4.271-0.314,6.278l43.896,89.341c1.088,2.215,3.342,3.619,5.811,3.619h3.988 l-11.457,25.863c-0.888,2.002-0.701,4.317,0.493,6.153c1.194,1.835,3.236,2.942,5.426,2.942h29.729c2.477,0,4.735-1.412,5.82-3.638 l15.264-31.321h64.921l-10.647,23.229c-0.104,0.226-0.159,0.459-0.235,0.688c-43.954,0.947-79.755,14.972-103.513,27.799 c-30.866,16.665-48.293,34.572-49.02,35.327c-2.603,2.7-2.523,6.996,0.176,9.602c2.695,2.605,6.997,2.529,9.605-0.166 c0.167-0.172,16.982-17.381,46.134-33.039c26.713-14.348,69.623-30.324,122.347-24.916 c101.232,10.373,140.068,57.023,140.436,57.476c1.342,1.681,3.318,2.556,5.314,2.556c1.486,0,2.983-0.485,4.236-1.485 c2.933-2.342,3.412-6.618,1.07-9.552c-1.676-2.098-42.266-51.51-149.67-62.516c-4.411-0.452-8.748-0.748-13.024-0.931 l11.032-24.071h43.301l15.264,31.321c1.084,2.226,3.344,3.638,5.82,3.638h29.729c2.19,0,4.232-1.107,5.426-2.942 c1.194-1.836,1.381-4.151,0.493-6.153l-11.457-25.863h2.823c3.575,0,6.474-2.898,6.474-6.475v-31.075 c0-3.575-2.898-6.474-6.474-6.474h-71.222l33.848-73.848l127.85,57.669c0.844,0.382,1.752,0.573,2.661,0.573 c0.775,0,1.552-0.14,2.292-0.419c1.605-0.608,2.904-1.828,3.609-3.394C487.507,249.945,488.792,208.597,474.407,170.574z M176.061,372.457h-15.734l9.752-22.012h16.709L176.061,372.457z M364.52,372.457h-15.734l-10.727-22.012h16.709L364.52,372.457z M365.279,337.497h-6.299h-31.278H197.144h-31.278h-9.906l-37.535-76.394h25.178l27.631,54.711 c1.102,2.181,3.336,3.556,5.779,3.556h188.268V337.497z M395.338,245.866l-55.564-25.063l-11.801-5.324l-53.941-24.331 c16.947-39.323,41.465-66.88,72.942-81.962c13.902-6.661,26.294-9.34,34.491-10.417c3.173-0.417,5.737-0.602,7.488-0.673 c1.068,1.371,2.565,3.419,4.281,6.067c4.486,6.925,10.512,18.093,14.613,33.022C417.107,170.879,412.896,207.415,395.338,245.866z"></path>{" "}
                      <path d="M80.349,181.725c23.21,0,42.094-18.884,4  094-42.094s-18.884-42.094-42.094-42.094s-42.093,  .884-42.093,42.094 S57.139,181.725,80.349,181.725 M80.349,110.485c16.071,0,29.146,13.074,29.146,29.146 13.074,29.146-29.146,29.146 s-29.146-13.074-29.146-  .146S64.277,110.485,80.349,110.485z"></path>{" "}
                      <path d="M80.424,91.485c3.576,0,6.474-2.897,6.474-6.474V69.474C86.897,65.898,84,63,80.424,63s-6.475,2.898-6.475,6.474v15.538 C73.949,88.588,76.848,91.485,80.424,91.485z"></path>{" "}
                      <path d="M80.424,188.596c-3.576,0-6.475,2.897-6.475,6.474v14.243c0,3.575,2.898,6.474,6.475,6.474s6.474-2.898,6.474-6.474 v-14.243C86.897,191.493,84,188.596,80.424,188.596z"></path>{" "}
                      <path d="M128.331,140.688c0,3.576,2.898,6.475,6.474,6.475h14.243c3.576,0,6.474-2.898,6.474-6.475 c0-3.575-2.897-6.474-6.474-6.474h-14.243C131.229,134.214,128.331,137.112,128.331,140.688z"></path>{" "}
                      <path d="M9.209,147.162h15.538c3.576,0,6.474-2.898,6.474-6.475c0-3.575-2.897-6.474-6.474-6.474H9.209 c-3.575,0-6.474,2.898-6.474,6.474C2.735,144.264,5.634,147.162,9.209,147.162z"></path>{" "}
                      <path d="M123.433,174.782c-2.529-2.528-6.627-2.53-9.155-0.001c-2.529,2.527-2.529,6.627-0.002,9.156l10.401,10.403 c1.265,1.265,2.921,1.896,4.579,1.896c1.656,0,3.313-0.632,4.577-1.896c2.528-2.527,2.528-6.627,0.001-9.155L123.433,174.782z"></path>{" "}
                      <path d="M35.977,105.639c1.265,1.263,2.921,1.896,4.578,1.896c1.656,0,3.313-0.633,4.578-1.897 c2.527-2.528,2.527-6.628-0.001-9.155L34.728,86.08c-2.528-2.526-6.627-2.527-9.156,0.001c-2.527,2.529-2.527,6.628,0.002,9.156 L35.977,105.639z"></path>{" "}
                      <path d="M118.854,107.534c1.656,0,3.314-0.633,4.578-1.897l10.401-10.4c2.528-2.528,2.528-6.627,0-9.155 c-2.526-2.528-6.629-2.528-9.155,0l-10.4,10.401c-2.529,2.527-2.529,6.627,0,9.154C115.54,106.901,117.197,107.534,118.854,107.534 z"></path>{" "}
                      <path d="M34.728,194.341l10.404-10.403c2.528-2.528,2.528-6.627,0-9.155c-2.526-2.528-6.629-2.528-9.155,0l-10.403,10.404 c-2.529,2.527-2.529,6.627,0,9.154c1.263,1.265,2.921,1.896,4.577,1.896S33.465,195.605,34.728,194.341z"></path>{" "}
                      <path d="M500.504,183.038c-3.535,0.535-5.969,3.833-5.436,7.368c0.23,1.523,0.408,2.568,0.555,3.434 c0.311,1.825,0.452,2.657,0.713,6.09c0.256,3.399,3.094,5.986,6.448,5.986c0.163,0,0.329-0.007,0.494-0.02 c3.564-0.27,6.236-3.377,5.968-6.942c-0.291-3.862-0.484-5.089-0.857-7.285c-0.137-0.806-0.303-1.777-0.517-3.195 C507.339,184.938,504.047,182.501,500.504,183.038z"></path>{" "}
                      <path d="M478.446,139.386c2.089,3.797,4.037,7.803,5.788,11.905c2.001,4.687,3.799,9.624,5.346,14.676 c0.854,2.788,3.417,4.581,6.188,4.581c0.628,0,1.266-0.091,1.896-0.284c3.42-1.047,5.343-4.666,4.297-8.085 c-1.681-5.49-3.638-10.863-5.818-15.971c-1.92-4.497-4.057-8.893-6.352-13.063c-6.176-11.227-13.708-21.279-22.389-29.883 c-2.538-2.518-6.637-2.5-9.154,0.04c-2.518,2.539-2.5,6.639,0.04,9.154C466.086,120.186,472.868,129.247,478.446,139.386z"></path>{" "}
                    </g>{" "}
                  </g>
                </svg>
              </div>
            </div>

           
          </div>
        </div>

        {/* Employee Services Heading */}
        <div className="mt-1 mt-md-4">
          <h3 className="mb-3 mb-md-5">Employee Services</h3>
          <div className="row g-4">
            <div className="col-md-4 col-sm-6">
              <div className="border rounded d-flex flex-column text-center align-items-center p-md-3">
                <img
                  src={logo5}
                  alt="img-fluid"
                  style={{ height: "40px", width: "40px", marginTop: "26px" }}
                />
                <h5 className="mt-1 mt-md-3 mb-1 mb-md-3">Wellbeing</h5>
                <p>
                  Access wellness resources, support tools,
                  <br /> and initiatives designed for your wellbeing.
                </p>
                <button className="btn bg-danger text-white mb-2">
                  Find out more
                </button>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="border rounded d-flex flex-column text-center align-items-center p-md-3">
                <img
                  src={logo3}
                  alt="img-fluid"
                  style={{ height: "40px", width: "40px", marginTop: "26px" }}
                />
                <h5 className="mt-1 mt-md-3 mb-1 mb-md-3">Culture & Engagement</h5>
                <p>Explore updates, events, <br /> and programs that strengthen team culture.</p>
                <button className="btn bg-danger text-white mb-2">
                  Find out more
                </button>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="border rounded d-flex flex-column text-center align-items-center p-md-3">
                <img
                  src={logo4}
                  alt="img-fluid"
                  style={{ height: "40px", width: "40px", marginTop: "26px" }}
                />
                <h5 className="mt-1 mt-md-3 mb-1 mb-md-3">Growth & Development</h5>
                <p>Build your career through learning paths, <br /> training, and development opportunities.</p>
                <button className="btn bg-danger text-white mb-2">
                  Find out more
                </button>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="border rounded d-flex flex-column text-center align-items-center p-md-3">
                <img
                  src={logo1}
                  alt="img-fluid"
                  style={{ height: "40px", width: "40px", marginTop: "26px" }}
                />
                <h5 className="mt-1 mt-md-3 mb-1 mb-md-3">Compensation & Benefits</h5>
                <p>Review salary, allowances, <br /> and benefit information in one secure place.</p>
                <button className="btn bg-danger text-white mb-2">
                  Find out more
                </button>
              </div>
            </div>

            
          </div>
        </div>

        <h3 className="mt-4 mt-md-5">Company Gallery</h3>
      </div>

      {/* Company Gallery */}
      <div className="w-100 overflow-hidden mt-2 mt-md-5">
        <div className="row g-0 m-0">
          {[img1, img2, img3, img4].map((img, index) => (
            <div key={index} className="col-3 p-0">
              <img
                src={img}
                className="w-100 d-block"
                alt={`Image ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="row g-0 m-0">
          {[img5, img6, img7, img8].map((img, index) => (
            <div key={index} className="col-3 p-0">
              <img
                src={img}
                className="w-100 d-block"
                alt={`Image ${index + 5}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tail */}
      <footer>
        <div
          className="row m-0 text-white"
          style={{ backgroundColor: "#515151" }}
        >
          <div className="col mt-4 ms-2 ms-md-5">
            <p className="">© 2024 Ambasphere-MTC</p>
          </div>
          <div className="col mt-2 mt-md-4 d-flex flex-inline justify-content-end me-2 me-md-5">
            <p style={{ fontSize: "12px", marginTop: "10px" }}>
              a digital innovation by
            </p>
            <img
  className="responsive-logo"
  src={logo}
  alt=""
/>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
