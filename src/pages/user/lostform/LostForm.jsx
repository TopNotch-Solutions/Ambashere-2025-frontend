import React, { useState, useEffect } from "react";
import DownloadDevicePriceList from "../../../components/user/DownloadDevicePriceList";
import Submit from "../../../components/user/Submit";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";

const LostForm = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const lastSubmit = localStorage.getItem("lastLossFormSubmit");
    if (lastSubmit) {
      const lastDate = new Date(lastSubmit);
      const now = new Date();
      if (
        lastDate.getFullYear() === now.getFullYear() &&
        lastDate.getMonth() === now.getMonth()
      ) {
        setCanSubmit(false); // Already submitted this month
      }
    }
  }, []);

  const handleSubmit = async () => {

    try{
       const response = await axiosInstance.post("/notifications/admin-notification", {
      EmployeeCode: currentUser.EmployeeCode,
      Type: "Admin Notification",
      Message: `${currentUser.FullName}(${currentUser.Email}) has initiated a General/Property Loss Claim. Please follow up with the user to guide them through the next steps of the claims process.`
     });

    if (![200, 201].includes(response.status)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Store the current date in localStorage
    localStorage.setItem("lastLossFormSubmit", new Date().toISOString());
    window.location.reload();
       //alert("Your claim has been successfully submitted.");
    // Disable the button
    setCanSubmit(false);
    }catch(error){

    }
  };

  return (
    <div className="container-main m-3">
      <div className="row d-flex flex-column flex-md-row justify-content-around m-auto">
        <div>
          <div className="row mb-2">
            <div className="col-lg-9">
              <h2>Report General or Property Loss</h2>
              <p>
                Click the check box below to initiate your <strong>General/Property Loss Claim</strong>.
                <br /><br />
                Please ensure you have the following information ready:
                <ul>
                  <li><strong>Insured Details:</strong> Policy number, contact information, etc.</li>
                  <li><strong>Loss or Damage Incident:</strong> Date, time, location, and a full description of how it occurred.</li>
                  <li><strong>Police Case Info:</strong> Police station, date reported, and reference number (if applicable).</li>
                  <li><strong>Other Interests:</strong> Indicate if any third party (e.g., a mortgagee) has an interest in the property.</li>
                  <li><strong>Other Insurance:</strong> Note if the loss/damage is covered under another policy.</li>
                  <li><strong>Stolen/Damaged Items:</strong> Provide a list of items, their quantity, and value/quotes.</li>
                </ul>
              </p>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="confirmationCheck"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="confirmationCheck">
                  Yes, I have all the required information.
                </label>
              </div>

              {isChecked && canSubmit && (
                <Submit onClick={handleSubmit} title="Submit" />
              )}

              {isChecked && !canSubmit && (
                <p className="text-danger mt-2">
                  You have already submitted a claim.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostForm;
