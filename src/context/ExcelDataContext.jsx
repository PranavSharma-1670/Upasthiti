// src/context/ExcelDataContext.jsx
import React, { createContext, useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";

const ExcelDataContext = createContext();

export const ExcelDataProvider = ({ children, sheetsToLoad = [] }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/school_sample_data.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const selectedSheets = {};

        workbook.SheetNames.forEach((sheetName) => {
          if (sheetsToLoad.length === 0 || sheetsToLoad.includes(sheetName)) {
            selectedSheets[sheetName] = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetName]
            );
          }
        });

        setData(selectedSheets);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error reading Excel file:", err);
        setLoading(false);
      });
  }, [sheetsToLoad]);

  // ✅ Add a row to a sheet
  const addRow = (sheetName, row) => {
    setData((prevData) => {
      const updatedSheet = prevData[sheetName]
        ? [...prevData[sheetName], row]
        : [row];
      return { ...prevData, [sheetName]: updatedSheet };
    });
  };

  return (
    <ExcelDataContext.Provider value={{ data, loading, addRow }}>
      {children}
    </ExcelDataContext.Provider>
  );
};

// Custom hook
export const useExcelData = () => useContext(ExcelDataContext);
