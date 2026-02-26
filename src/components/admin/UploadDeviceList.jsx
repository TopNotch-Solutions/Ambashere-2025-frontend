import React, { useState, useRef } from "react";
import { Box, Button, Modal, Typography, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import CloseButton from "react-bootstrap/CloseButton";
import axiosInstance from "../../utils/axiosInstance";

const UploadDeviceList = ({ open, handleClose }) => {
  const inputRef = useRef();

  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("select");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const allowedExtensions = /(\.xls|\.xlsx)$/i;
      const validMimeTypes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      ];

      if (!allowedExtensions.exec(file.name)) {
        setError("Please upload a valid Excel file with .xls or .xlsx extension.");
        setSelectedFile(null);
        return;
      }

      if (!validMimeTypes.includes(file.type)) {
        setError("The file type does not match an Excel file. Please upload a valid Excel file.");
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

      const response = await axiosInstance.post("/priceList/upload-device-list", formData, {
        onUploadProgress: (progressEvent) => {
          const percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentageCompleted);
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
      console.error("Upload failed:", err);
      setUploadStatus("select");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        className="d-flex flex-column justify-content-center align-items-center m-auto rounded-3"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          maxHeight: "95vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: 12,
          p: 4,
        }}
      >
        <Typography variant="h4" className="pt-3 fw-bold text-center">Upload Device Price List</Typography>
        <Box
          className="mt-4 d-flex flex-column justify-content-center align-items-center"
          sx={{ width: "100%" }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <Button
            className="file-btn m-3 m-sm-4"
            onClick={onChooseFile}
            variant="contained"
            color="secondary"
            startIcon={<CloudUploadIcon sx={{ fontSize: 40, color: "#1674BB" }} />}
          >
            Drag & drop files or <span className="blue-text">Browse</span>
            <Typography variant="caption" className="under-text">Supported format: XLSX</Typography>
          </Button>

          {error && (
            <Typography color="error" className="mt-4 mb-4 text-center">
              {error}
            </Typography>
          )}

          {selectedFile && (
            <Box className="file-card">
              <DescriptionSharpIcon className="icon" />
              <Box className="file-info">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">{selectedFile.name}</Typography>
                  <Box className="progress-bg">
                    <Box
                      className="progress"
                      sx={{ width: `${progress}%` }}
                    />
                  </Box>
                </Box>

                <Button onClick={clearFileInput} className="close-icon" variant="text">
                  <CloseButton />
                </Button>
              </Box>

              <Button
                className="upload-btn mb-3"
                onClick={handleFileUpload}
                variant="contained"
                color="primary"
              >
                {uploadStatus === "select" || uploadStatus === "uploading" ? "Upload File" : "Done"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default UploadDeviceList;
