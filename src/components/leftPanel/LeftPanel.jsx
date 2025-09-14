import React from "react";
import Cards from "./Cards";
import CalendarWidget from "./CalendarWidget";
import DataTable from "./DataTable";

const LeftPanel = () => {
  return (
    <>
      <Cards />
      <CalendarWidget />
      <DataTable />
    </>
  );
};

export default LeftPanel;
