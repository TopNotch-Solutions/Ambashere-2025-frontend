import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { tokens } from "../../../theme";
import axiosInstance from "../../../utils/axiosInstance";

const Personal = () => {
  const { employeeCode } = useParams();
  const [employee, setEmployee] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  let profileImage = employee?.ProfileImage
    ? JSON.parse(employee.ProfileImage).ProfileImage
    : null;

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axiosInstance.get(
          `/staffmember/${employeeCode}`
        );
        setEmployee(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeCode]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!employee) {
    return <div>Error: Unable to fetch employee data.</div>;
  }

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        {/* CONTACT INFO  */}
        <div className="col-12 col-lg-5 mb-4 mb-lg-0 mb-sm-0 border rounded-3 d-flex flex-column p-3 align-items-center b-g">
          <div className="position-relative">
            <div className="row">
              <div className="d-flex row text-center">
                <h5>CONTACT INFORMATION</h5>
                <div className="border-bottom"></div>
                <div className="col mt-2 text-start fw-bold">
                  <p>First Name</p>
                  <p>Last Name</p>
                  <p>Email</p>
                  <p>Mobile Phone</p>
                  <p>Service Plan Category</p>
                </div>
                <div className="col mt-2 text-start">
                  {" "}
                  <p>{employee.FirstName}</p>
                  <p>{employee.LastName}</p>
                  <p>{employee.Email}</p>
                  <p>{employee.PhoneNumber}</p>
                  <p>{employee.ServicePlan}</p>
                </div>
              </div>
              <div className="col"></div>
            </div>
          </div>
        </div>

        {/* EMPLOYEE INFO */}
        <div className="col-12 col-lg-6 border rounded-3 d-flex flex-column p-3  b-g">
          <div className="position-relative">
            <div className="row">
              <div className="d-flex row ">
                <h5 className="text-center">EMPLOYEE INFORMATION</h5>
                <div className="border-bottom mb-3"></div>
                <div className="col-3 mt-2 text-start fw-bold">
                  <p>Job Title</p>
                  <p>Department</p>
                  <p>Email</p>
                  <p>Category</p>
                </div>
                <div className="col-8 mt-2">
                  <p>{employee.Position}</p>
                  <p>{employee.Department}</p>
                  <p>{employee.Email}</p>
                  <p>{employee.EmploymentCategory}</p>
                </div>
                {/* <div className="col-sm-4">
                  <img className="img-fluid" src={profileImage} style={{ height: "100%", width: "30%" }} alt="Responsive image" />
                </div> */}
              </div>
              {/* <div className="col"></div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personal;
