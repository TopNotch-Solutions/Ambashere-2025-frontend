import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const DownloadDevicePriceList = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        const response = await axiosInstance.get("/priceList/");
        if (response.data.fileUrl) {
          setFileUrl(response.data.fileUrl);
        } else {
          Swal.fire({
            title: "No File Available",
            text: "There is currently no device price list available for download.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      } catch (err) {
        console.error("Failed to fetch file URL:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to retrieve the device price list.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFileUrl();
  }, []);

  const handleDownloadClick = async () => {
    if (fileUrl) {
      try {
        const response = await axiosInstance.get(fileUrl, {
          responseType: "blob", // Important to handle binary data
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileUrl.substring(fileUrl.lastIndexOf("/") + 1)); // Set file name
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to download the file.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      Swal.fire({
        title: "No File Available",
        text: "There is currently no device price list available for download.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      {!loading && (
        <Button
          style={{
            gap: "10px",
            height: "100%",
            backgroundColor: "#0096D6",
            color: "#fff",
            padding: "8px",
            paddingLeft: "20px",
            paddingRight: "20px",
            borderRadius: "5px",
            cursor: "pointer",
            borderColor: "#1A69AC",
            border: "1px solid",
          }}
          onClick={handleDownloadClick}
        >
          Download Price List
          <FileDownloadIcon size={16} />
        </Button>
      )}
    </>
  );
};

export default DownloadDevicePriceList;
