// EmployeeCodeContext.js
import React, { createContext, useState, useContext } from "react";

const EmployeeCodeContext = createContext();

export const EmployeeCodeProvider = ({ children }) => {
  const [employeeCode, setEmployeeCode] = useState("");

  return (
    <EmployeeCodeContext.Provider value={{ employeeCode, setEmployeeCode }}>
      {children}
    </EmployeeCodeContext.Provider>
  );
};

export const useEmployeeCode = () => useContext(EmployeeCodeContext);
