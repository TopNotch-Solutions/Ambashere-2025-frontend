import React, { useState, useRef, useEffect } from "react";
import { useTheme, useMediaQuery, CircularProgress, Typography, Box } from "@mui/material";
import "../../../assets/style/admin/profileCard.css";
import profile from "../../../assets/Img/blank-profile-picture-973460_960_720.webp";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import Form from "react-bootstrap/Form";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import InputGroup from "react-bootstrap/InputGroup";
import { useSelector, useDispatch } from "react-redux";
import { updateProfileImage } from "../../../store/reducers/authReducer";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";

function UserProfileCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("select");
  const currentUser = useSelector((state) => state.auth.user);
  const [error, setError] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const dispatch = useDispatch();
  let profileImage;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const buttonStyle = {
    color: "red",
    borderColor: "red",
  };
  // console.log(currentUser);

  const [formValues, setFormValues] = useState({
    FirstName: "",
    LastName: "",
    FullName: "",
    Email: "",
    PhoneNumber: "",
    Gender: "",
    Position: "",
    Department: "",
    Division: "",
    EmploymentCategory: "",
    EmploymentStatus: "",
    EmployeeCode: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormValues({
        FirstName: currentUser.FirstName,
        LastName: currentUser.LastName,
        FullName: currentUser.FullName,
        Email: currentUser.Email,
        PhoneNumber: currentUser.PhoneNumber,
        Gender: currentUser.Gender,
        Position: currentUser.Position,
        Department: currentUser.Department,
        Division: currentUser.Division,
        EmploymentCategory: currentUser.EmploymentCategory,
        EmploymentStatus: currentUser.EmploymentStatus,
        EmployeeCode: currentUser.EmployeeCode,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.ProfileImage) {
      const parsedData = JSON.parse(currentUser.ProfileImage);
      profileImage = parsedData.ProfileImage;
      setProfilePic(profileImage);
      // console.log(profileImage);
    }
  }, [currentUser]);

  const convertToBase64 = (file) => {
    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      setNewProfilePic(reader.result);
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      const validMimeTypes = [
        "image/jpeg", // .jpg and .jpeg
        "image/png", // .png
      ];

      if (!allowedExtensions.exec(file.name)) {
        setError(
          "Please upload a valid image file with .jpg, .jpeg, or .png extension."
        );
        setSelectedFile(null);
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        setError(
          "The file type does not match an image file. Please upload a valid image file."
        );
        setSelectedFile(null);
        return;
      }

      setError("");
      setSelectedFile(file);
      convertToBase64(file);
    }
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setNewProfilePic("");
    setUploadStatus("select");
    setError("");
  };

  const handleFileUpload = async () => {
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("ProfileImage", selectedFile);

      const response = await axiosInstance.post(
        `image/${currentUser.EmployeeCode}/profilePicture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;
      // console.log("Upload successful:", data.ProfileImage);

      // Update local state with new ProfileImage
      setProfilePic(data.ProfileImage);

      // Optionally update Redux state if needed
      dispatch(updateProfileImage({ ProfileImage: data.ProfileImage }));

      clearFileInput();
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("select");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => {
    inputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const response = await axiosInstance.put(
        `/staffmember/updateStaff/${currentUser.EmployeeCode}`,
        formValues
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Profile updated successfully!`,
        });
        setIsEditing(false);
      } else {
        console.log(response.data);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: `Failed to update profile. Please try again!`,
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: `Failed to update profile. Please try again!`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div className="col-12  col-lg-5 rounded-3 shadow p-4 d-flex flex-column justify-content-center align-items-center b-g me-3">
          <div className="position-relative">
            {/* <div
              className="bg-white rounded-circle position-absolute camera-top d-flex align-items-center justify-content-center"
              style={{ width: "30px", height: "30px", cursor: "pointer" }}
              onClick={selectedFile ? clearFileInput : handleCameraClick}
            >
              {selectedFile ? (
                <CloseIcon
                  style={{ width: "24px", height: "24px", color: "#1674BB" }}
                />
              ) : (
                <CameraAltIcon
                  style={{ width: "24px", height: "24px", color: "#1674BB" }}
                />
              )}
            </div> */}
            <img
              src={selectedFile ? newProfilePic : profilePic || profile}
              className="circular-image img-responsive img-thumbnail"
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={inputRef}
              onChange={handleFileChange}
            />
          </div>
          {error && (
            <p className="error-text mt-4 mb-4 error-text text-center">
              {error}
            </p>
          )}
          {selectedFile && (
            <>
              <button 
                className="upload-btn mb-3" 
                onClick={handleFileUpload}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer"
                }}
              >
                {isLoading && <CircularProgress size={16} sx={{ color: "white" }} />}
                {isLoading 
                  ? "Uploading..." 
                  : uploadStatus === "select" || uploadStatus === "uploading"
                    ? "Upload Image"
                    : "Done"
                }
              </button>
            </>
          )}
          <h3 className="mt-2 text-center">
            {formValues.FirstName}
            {formValues.LastName}
          </h3>
          <p>{formValues.Position}</p>
        </div>

        {/* Profile Details */}
        <div
          className="col-12 col-lg-6 rounded-3 shadow b-g mt-3 mt-lg-0 me-3 "
          style={{ padding: 0 }}
        >
          <div
            className="bg-color d-flex align-items-center p-3"
            style={{ borderRadius: "0.35rem 0.35rem 0rem 0rem" }}
          >
            <h3 className="p-3 text-col">Edit Profile</h3>
            {/* <Stack direction="row" spacing={2}>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  size={isSmallScreen ? "small" : "medium"}
                  color="info"
                  endIcon={<EditIcon />}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outlined"
                  size={isSmallScreen ? "small" : "medium"}
                  style={buttonStyle}
                  endIcon={<DeleteIcon />}
                >
                  Undo
                </Button>
              )}
            </Stack> */}
          </div>
          <form className="mt-3" onSubmit={handleUpdateInfo}>
            <div className="row d-flex justify-content-around">
              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">First Name</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="FirstName"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="FirstName"
                    name="FirstName"
                    value={formValues.FirstName}
                    disabled
                  />
                </InputGroup>
              </div>

              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Surname</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="LastName"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="LastName"
                    name="LastName"
                    value={formValues.LastName}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="row d-flex justify-content-around">
              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Full Name</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="FullName"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="FullName"
                    name="FullName"
                    value={formValues.FullName}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>

              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Email Address</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="Email"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="Email"
                    name="Email"
                    value={formValues.Email}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="row d-flex justify-content-around">
              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Mobile Number</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="PhoneNumber"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="PhoneNumber"
                    name="PhoneNumber"
                    value={formValues.PhoneNumber}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>

              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Gender</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="Gender"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="Gender"
                    name="Gender"
                    value={formValues.Gender}
                    disabled
                  />
                </InputGroup>
              </div>
            </div>

            <div className="row d-flex justify-content-around">
              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Position</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="Position"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="Position"
                    name="Position"
                    value={formValues.Position}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>

              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Department</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="Department "
                    aria-describedby="basic-addon1"
                    type="text"
                    id="Department"
                    name="Department"
                    value={formValues.Department}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>
            </div>

            <div className="row d-flex justify-content-around">
              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Division</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="Division"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="Division"
                    name="Division"
                    value={formValues.Division}
                    disabled={!isEditing}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>

              <div className="col-11 col-sm-5">
                <label htmlFor="exampleInputEmail1">Employee Code</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    aria-label="EmployeeCode"
                    aria-describedby="basic-addon1"
                    type="text"
                    id="EmployeeCode"
                    name="EmployeeCode"
                    value={formValues.EmployeeCode}
                    disabled
                  />
                </InputGroup>
              </div>
            </div>

            {/* Temporary User Specific Information */}
            {currentUser?.EmploymentCategory === "Temporary" && (
              <>
                <div className="row d-flex justify-content-around">
                  <div className="col-11 col-sm-5">
                    <label htmlFor="exampleInputEmail1">Employment Category</label>
                    <InputGroup className="mb-3">
                      <Form.Control
                        aria-label="EmploymentCategory"
                        aria-describedby="basic-addon1"
                        type="text"
                        id="EmploymentCategory"
                        name="EmploymentCategory"
                        value={formValues.EmploymentCategory}
                        disabled
                      />
                    </InputGroup>
                  </div>

                  <div className="col-11 col-sm-5">
                    <label htmlFor="exampleInputEmail1">Employment Status</label>
                    <InputGroup className="mb-3">
                      <Form.Control
                        aria-label="EmploymentStatus"
                        aria-describedby="basic-addon1"
                        type="text"
                        id="EmploymentStatus"
                        name="EmploymentStatus"
                        value={formValues.EmploymentStatus}
                        disabled
                      />
                    </InputGroup>
                  </div>
                </div>

                {/* Temporary User Notice */}
                <div className="row d-flex justify-content-center mb-3">
                  <div className="col-11">
                    <div className="alert alert-info" role="alert">
                      <strong>Temporary Staff Notice:</strong> Your profile information is managed by HR. 
                      Contact HR at hr@mtc.com.na for updates to employment details, department, or position.
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="row d-flex justify-content-start p-4">
              {isEditing ? (
                <button
                  type="button"
                  className="button2"
                  onClick={handleUpdateInfo}
                  disabled={isSaving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? "not-allowed" : "pointer"
                  }}
                >
                  {isSaving && <CircularProgress size={16} sx={{ color: "white" }} />}
                  {isSaving ? "Saving..." : "Update Info"}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfileCard;
