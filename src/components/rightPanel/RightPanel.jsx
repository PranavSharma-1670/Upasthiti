// src/components/rightPanel/RightPanel.jsx
import React, { useState } from "react";
import { useExcelData } from "../../context/ExcelDataContext";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import DataDisplay from "./DataDisplay";

const RightPanel = () => {
  const { data, loading } = useExcelData();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("Tree"); // Default to Tre

  if (loading) {
    return <div className="card p-3">Loading data...</div>;
  }

  // Filter students
  const filteredStudents = data.Students
    ? data.Students.filter((student) =>
        `${student["First Name"]} ${student["Last Name"]}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="card shadow-sm p-3 w-100 h-100 d-flex flex-column" style={{
      minHeight: "850px",
      maxHeight: "850px",
      overflowY: "auto",
    }}>
      {/* Header + Search */}
      <div className="sticky-top bg-white pb-2">
        <h5 className="mb-3">Search Records</h5>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* View Toggle Buttons */}
      <div className="mt-3 mb-3">
        <ViewToggle viewType={viewType} setViewType={setViewType} />
      </div>

      {/* Data Display (scrollable area only) */}
      <div
        className="border rounded p-2 bg-light"
        style={{
          minHeight: "480px",
          maxHeight: "780px",
          overflowY: "auto",
        }}
      >
        <DataDisplay viewType={viewType} students={filteredStudents} />
      </div>
    </div>
  );
};

export default RightPanel;
