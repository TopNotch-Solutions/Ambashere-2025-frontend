import { React, useState, useRef } from "react";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../assets/style/admin/fileUpload.css";
import { useTheme } from "@emotion/react";
import CloseButton from "react-bootstrap/CloseButton";
import axiosInstance from "../../../utils/axiosInstance";
import { Modal } from "@mui/material";

const UploadVoucher = ({ open, handleClose }) => {
  const theme = useTheme();
  const inputRef = useRef();

  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const allowedExtensions = /(\.xls|\.xlsx|\.pdf)$/i;
      const validMimeTypes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/pdf", // .pdf
      ];

      if (!allowedExtensions.exec(file.name)) {
        setError(
          "Please upload a valid file with .xls, .xlsx, or .pdf extension."
        );
        setSelectedFile(null);
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        setError(
          "The file type is not supported. Please upload an Excel (.xls, .xlsx) or PDF (.pdf) file."
        );
        setSelectedFile(null);
        return;
      }

      setError("");
      setSelectedFile(file);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const clearFileInput = () => {
    inputRef.current.value = "";
    setSelectedFile(null);
    setProgress(0);
    setUploadStatus("select");
    setError("");
  };

  const handleFileUpload = async () => {
    if (uploadStatus === "done") {
      clearFileInput();
      return;
    }

    try {
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axiosInstance.post("/file/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentageCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentageCompleted); // Update the progress state
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setUploadStatus("done");
      } else {
        console.error("Upload failed with status:", response.status);
        setUploadStatus("select");
      }
    } catch (err) {
      console.error("Upload failed:", err); // Log the error for debugging
      setUploadStatus("select");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="col-11 col-sm-10 col-md-10 col-lg-9 col-xl-8 col-xxl-5 d-flex flex-column justify-content-center align-items-center m-auto rounded-3 p-2 p-sm-4 shadow b-g">
        <h1 className="pt-3 fw-bold h3">Upload</h1>
        <div
          className="mt-4 d-flex flex-column justify-content-center align-items-center"
          style={{ width: "100%" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx,.pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button className="file-btn m-3 m-sm-4" onClick={onChooseFile}>
            <CloudUploadIcon sx={{ fontSize: 40, color: "#1674BB" }} />
            <p>
              Drag & drop files or <span className="blue-text">Browse</span>
            </p>
            <p className="under-text"> Supported formats: XLSX, XLS, PDF</p>
          </button>

          {error && (
            <p className="error-text mt-4 mb-4 error-text text-center">
              {error}
            </p>
          )}

          {selectedFile && (
            <>
              <div className="file-card">
                <DescriptionSharpIcon className="icon" />
                <div className="file-info">
                  <div style={{ flex: 1 }}>
                    <h6>{selectedFile.name}</h6>
                    <div className="progress-bg">
                      <div
                        className="progress"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button onClick={clearFileInput} className="close-icon">
                    <CloseButton />
                  </button>
                </div>
              </div>

              <button className="upload-btn mb-3" onClick={handleFileUpload}>
                {uploadStatus === "select" || uploadStatus === "uploading"
                  ? "Upload File"
                  : "Done"}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UploadVoucher;
